export interface ConversationsResponse {
  success: boolean
  data: Conversation[]
  count: number
}

export interface Conversation {
  id: string
  customerNumber: string
  sellerNumber: string
  managerNumber: string
  createdAt: string
  senderName?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}
export interface MessageDTOClient {
  conversation: ConversationCleint
  message: MessageClient
  type: string
}

export interface ConversationCleint {
  id: string
  customerNumber: string
  sellerNumber: string
  managerNumber: string
  createdAt: string
}

export interface MessageClient {
  conversationId: string
  customerNumber: string
  sellerNumber: string
  managerNumber: string
  messageId: string
  sender: string
  messageType: string
  text: string
  mediaType: string
  rawMessage: string
  pushName: string
  messageTimestamp: string
  mimetype: any
  fileName: any
  quotedMessageId: any
  managerForwardedMessageId: any
  id: string
  createdAt: string
}
