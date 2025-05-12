ALTER TABLE "chats" ADD CONSTRAINT "chats_humeChatId_unique" UNIQUE("hume_chat_id");--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_requestId_unique" UNIQUE("request_id");