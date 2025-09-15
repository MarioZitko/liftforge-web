export interface Coach {
  id: string;
  userId: string;
  bio?: string;
  certification?: string;
  lookingForClient?: boolean;
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
  bio?: string;
  lookingForClient?: boolean;
}

export interface InviteClientDto {
  email: string;
}
