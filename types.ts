
export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  RH = 'RH',
  SAFETY = 'SAFETY',
  MEDICINE = 'MEDICINE',
  ADMIN = 'ADMIN',
  REGISTRATIONS = 'REGISTRATIONS',
  TRAINING = 'TRAINING'
}

export type UserRole = 'MASTER' | 'MANAGER' | 'USER';

export interface Permission {
  moduleId: string;
  subModules: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MASTER' | 'MANAGER' | 'USER';
  functionName?: string;
  permissions: Permission[];
  allowedBranches?: string[];
  allowedModules?: string[];
  parentUserId?: string;
}

export interface Role {
  id: string;
  registration: string;
  name: string;
  functionId: string;
  description: string;
}

export interface JobFunction {
  id: string;
  registration: string;
  name: string;
  cbo: string;
  description: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  cnae: string;
  address: string;
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  cnpj: string;
  cnae: string;
  address: string;
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface Collaborator {
  id: string;
  registration: string;
  name: string;
  cpf: string;
  rg: string;
  motherName: string;
  fatherName: string;
  birthDate: string;
  birthPlace: string;
  birthState: string;
  nationality: string;
  education: string;
  maritalStatus: string;
  gender: string;
  race: string;
  address: string;
  phone: string;
  email: string;
  roleId: string;
  functionId: string;
  companyId: string;
  branchId: string;
  admissionDate: string;
  terminationDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isDisabled: boolean;
  disabilityType?: string;
  workRegime: 'EFFECTIVE' | 'THIRD_PARTY';
  thirdPartyCompanyName?: string;
  eSocialCode?: string;
}

export interface MedicalCertificate {
  id: string;
  collaboratorId: string;
  startDate: string;
  endDate: string;
  days: number;
  cid?: string;
  reason: string;
  type: 'MEDICAL' | 'ACCIDENT' | 'FAMILY' | 'OTHER';
}

// --- CIPA TYPES ---
export type CipaRole = 'PRESIDENTE' | 'VICE_PRESIDENTE' | 'SECRETARIO' | 'TITULAR' | 'SUPLENTE';
export type CipaOrigin = 'EMPREGADOR' | 'EMPREGADO';

export interface CipaTerm {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  branchId: string;
  status: 'ACTIVE' | 'FINISHED' | 'ELECTION';
}

export interface CipaElection {
  id: string;
  termId: string;
  currentTermEndDate: string;
  riskDegree: 1 | 2 | 3 | 4;
  employeeCount: number;
  dimensioning: {
    efetivos: number;
    suplentes: number;
  };
  calendar: {
    convocacao: string;
    comissao: string;
    edital: string;
    inscricoes: string;
    eleicao: string;
    posse: string;
  };
}

export interface Cipeiro {
  id: string;
  termId: string;
  collaboratorId: string;
  cipaRole: CipaRole;
  origin: CipaOrigin;
  votes?: number;
}

export interface CipaMeeting {
  id: string;
  termId: string;
  date: string;
  title: string;
  description: string;
  type: 'ORDINARY' | 'EXTRAORDINARY';
}

export interface CipaActionPlan {
  id: string;
  meetingId: string;
  description: string;
  deadline: string;
  responsibleId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'DELAYED';
}

export interface MenuSubItem {
  id: string;
  label: string;
  component: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  module: ModuleType;
  subItems: MenuSubItem[];
}
