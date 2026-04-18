import type { User, Listing, Conversation, Message, Role, ListingStatus, Category } from "@prisma/client";

export type { Role, ListingStatus, Category };

export type SafeUser = Omit<User, "passwordHash">;

export type ListingWithBroker = Listing & {
  submittedBy: SafeUser;
  _count?: { savedBy: number };
  isSaved?: boolean;
};

export type ConversationWithDetails = Conversation & {
  listing: Pick<Listing, "id" | "title" | "photos" | "price" | "location" | "category" | "status">;
  participantA: SafeUser;
  participantB: SafeUser;
  messages: MessageWithSender[];
  _count: { messages: number };
  unreadCount?: number;
};

export type MessageWithSender = Message & {
  sender: SafeUser;
};

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: "MEMBER" | "VIP" | "OWNER";
};

export interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc";
  search?: string;
  status?: "all" | "active" | "pending";
}
