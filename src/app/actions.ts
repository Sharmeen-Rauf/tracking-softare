'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Fetch all employees and their client accounts
export async function getEmployees() {
  try {
    return await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { accounts: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

// Create a new employee
export async function createEmployee(name: string, email: string) {
  try {
    if (!name.trim() || !email.trim()) {
      throw new Error('Name and email are required.');
    }
    const employee = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        passwordHash: 'simulated_hash_password',
        role: 'EMPLOYEE',
      },
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, employee };
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return { success: false, error: error.message || 'Failed to create employee.' };
  }
}

// Create a new client account for an employee
export async function createClientAccount(name: string, employeeId: string) {
  try {
    if (!name.trim() || !employeeId) {
      throw new Error('Client account name and employee ID are required.');
    }
    const clientAccount = await prisma.clientAccount.create({
      data: {
        name: name.trim(),
        employeeId,
      },
    });
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/employee`);
    return { success: true, clientAccount };
  } catch (error: any) {
    console.error('Error creating client account:', error);
    return { success: false, error: error.message || 'Failed to create client account.' };
  }
}

// Fetch all submissions for the admin dashboard
export async function getSubmissions() {
  try {
    const rawSubmissions = await prisma.submission.findMany({
      include: {
        clientAccount: true,
        submittedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format to match the frontend SubmissionLog interface in AdminDashboard
    return rawSubmissions.map((sub) => ({
      id: sub.id,
      url: sub.url,
      platform: sub.platform,
      clientAccountId: sub.clientAccountId,
      clientAccountName: sub.clientAccount.name,
      submittedById: sub.submittedById,
      submittedByName: sub.submittedBy.name,
      createdAt: sub.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
}

// Fetch details for a specific employee portal
export async function getEmployeePortalData(employeeId: string) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      include: { accounts: true },
    });

    if (!employee || employee.role !== 'EMPLOYEE') {
      return null;
    }

    const rawSubmissions = await prisma.submission.findMany({
      where: { submittedById: employeeId },
      orderBy: { createdAt: 'desc' },
    });

    // Format to match Submission interface in EmployeeForm
    const submissions = rawSubmissions.map(sub => ({
      id: sub.id,
      url: sub.url,
      platform: sub.platform,
      clientAccountId: sub.clientAccountId,
      createdAt: sub.createdAt
    }));

    return {
      employee,
      submissions
    };
  } catch (error) {
    console.error('Error fetching employee portal data:', error);
    return null;
  }
}

// Delete an employee (along with their client accounts and submissions via Cascade delete)
export async function deleteEmployee(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return { success: false, error: error.message };
  }
}
