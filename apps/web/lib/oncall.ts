import { db } from '@/lib/db';
import { rotationSchedules, onCallAssignments, users } from '@oncallkit/db';
import { eq, and, lte, gte, asc } from '@oncallkit/db';
import { toZonedTime } from 'date-fns-tz';
import { addDays, addHours } from 'date-fns';

export interface OnCallResult {
  currentUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  nextUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  shiftEnd: Date | null;
}

export async function calculateCurrentOnCall(scheduleId: string): Promise<OnCallResult> {
  const [schedule] = await db
    .select()
    .from(rotationSchedules)
    .where(eq(rotationSchedules.id, scheduleId))
    .limit(1);

  if (!schedule) {
    return { currentUser: null, nextUser: null, shiftEnd: null };
  }

  const members = schedule.members as Array<{ userId: string; order: number }>;

  if (!members || members.length === 0) {
    return { currentUser: null, nextUser: null, shiftEnd: null };
  }

  // Sort members by order
  const sortedMembers = [...members].sort((a, b) => a.order - b.order);

  if (schedule.type === 'custom') {
    // Use on_call_assignments table
    const now = new Date();
    const [assignment] = await db
      .select()
      .from(onCallAssignments)
      .where(
        and(
          eq(onCallAssignments.scheduleId, scheduleId),
          lte(onCallAssignments.startTime, now),
          gte(onCallAssignments.endTime, now),
        ),
      )
      .orderBy(asc(onCallAssignments.startTime))
      .limit(1);

    if (!assignment) {
      return { currentUser: null, nextUser: null, shiftEnd: null };
    }

    const [currentUser] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, assignment.userId))
      .limit(1);

    // Find next assignment
    const [nextAssignment] = await db
      .select()
      .from(onCallAssignments)
      .where(
        and(
          eq(onCallAssignments.scheduleId, scheduleId),
          gte(onCallAssignments.startTime, assignment.endTime),
        ),
      )
      .orderBy(asc(onCallAssignments.startTime))
      .limit(1);

    let nextUser = null;
    if (nextAssignment) {
      const [nu] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, nextAssignment.userId))
        .limit(1);
      nextUser = nu ?? null;
    }

    return {
      currentUser: currentUser ?? null,
      nextUser,
      shiftEnd: assignment.endTime,
    };
  }

  // Weekly or daily rotation
  const now = new Date();
  const timezone = schedule.timezone || 'UTC';
  const zonedNow = toZonedTime(now, timezone);
  const zonedStart = toZonedTime(schedule.startDate, timezone);

  const periodMs =
    schedule.type === 'weekly'
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  const elapsedMs = zonedNow.getTime() - zonedStart.getTime();
  const currentPeriod = Math.floor(elapsedMs / periodMs);
  const currentIndex = currentPeriod % sortedMembers.length;
  const nextIndex = (currentIndex + 1) % sortedMembers.length;

  const shiftStartMs = zonedStart.getTime() + currentPeriod * periodMs;
  const shiftEnd = new Date(shiftStartMs + periodMs);

  const currentMemberId = sortedMembers[currentIndex].userId;
  const nextMemberId = sortedMembers[nextIndex].userId;

  const [currentUser] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, currentMemberId))
    .limit(1);

  const [nextUser] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, nextMemberId))
    .limit(1);

  return {
    currentUser: currentUser ?? null,
    nextUser: nextUser ?? null,
    shiftEnd,
  };
}

export async function generateAssignments(
  scheduleId: string,
  daysAhead = 30,
): Promise<void> {
  const [schedule] = await db
    .select()
    .from(rotationSchedules)
    .where(eq(rotationSchedules.id, scheduleId))
    .limit(1);

  if (!schedule || schedule.type === 'custom') return;

  const members = (schedule.members as Array<{ userId: string; order: number }>)
    .sort((a, b) => a.order - b.order);

  if (members.length === 0) return;

  const now = new Date();
  const end = addDays(now, daysAhead);

  const periodFn = schedule.type === 'weekly'
    ? (d: Date) => addDays(d, 7)
    : (d: Date) => addHours(d, 24);

  // Clear existing future assignments
  // (simple approach: delete+recreate)
  const assignments: Array<{
    scheduleId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
  }> = [];

  let cursor = schedule.startDate;
  const timezone = schedule.timezone || 'UTC';
  const zonedStart = toZonedTime(schedule.startDate, timezone);
  const zonedNow = toZonedTime(now, timezone);
  const periodMs = schedule.type === 'weekly' ? 7 * 24 * 3600 * 1000 : 24 * 3600 * 1000;
  const elapsedMs = zonedNow.getTime() - zonedStart.getTime();
  const startPeriod = Math.max(0, Math.floor(elapsedMs / periodMs) - 1);

  cursor = new Date(zonedStart.getTime() + startPeriod * periodMs);
  let memberIdx = startPeriod % members.length;

  while (cursor < end) {
    const slotEnd = periodFn(cursor);
    assignments.push({
      scheduleId,
      userId: members[memberIdx % members.length].userId,
      startTime: cursor,
      endTime: slotEnd,
    });
    cursor = slotEnd;
    memberIdx++;
  }

  if (assignments.length > 0) {
    await db
      .insert(onCallAssignments)
      .values(assignments)
      .onConflictDoNothing();
  }
}
