export interface Coach {
  id: string;
  userId: string;
  certification?: string;
  user?: {
    name: string;
    email: string;
    emailVerified: boolean;
  };
}

export interface CreateCoachDto {
  userId: string;
  certification?: string;
}

export interface UpdateCoachDto {
  certification?: string;
}

export interface InviteClientDto {
  email: string;
}
