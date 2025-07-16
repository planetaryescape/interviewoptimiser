export interface ClerkEmailAddress {
  email_address: string;
  id: string;
  linked_to: any[];
  object: "email_address";
  reserved: boolean;
  verification: {
    status: string;
    strategy: string;
  };
}

export interface ClerkUserData {
  birthday: string | null;
  created_at: number;
  email_addresses: ClerkEmailAddress[];
  external_accounts: any[];
  external_id: string | null;
  first_name: string | null;
  gender: string | null;
  id: string;
  image_url: string;
  last_name: string | null;
  last_sign_in_at: number | null;
  object: "user";
  password_enabled: boolean;
  phone_numbers: any[];
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  private_metadata: Record<string, any>;
  profile_image_url: string;
  public_metadata: Record<string, any>;
  two_factor_enabled: boolean;
  unsafe_metadata: Record<string, any>;
  updated_at: number;
  username: string | null;
  web3_wallets: any[];
}

export interface ClerkWebhookEvent<T extends string, D = ClerkUserData> {
  data: D;
  event_attributes: {
    http_request: {
      client_ip: string;
      user_agent: string;
    };
  };
  object: "event";
  timestamp: number;
  type: T;
}

export type UserCreatedEvent = ClerkWebhookEvent<"user.created">;
export type UserUpdatedEvent = ClerkWebhookEvent<"user.updated">;
export type UserDeletedEvent = ClerkWebhookEvent<"user.deleted">;

export type ClerkWebhookPayload = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;
