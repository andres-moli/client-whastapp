// chat/hooks/useChat.ts
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

import { sellersData } from "../ChatSelector";
import { Conversation } from "../types";
import dayjs from "dayjs";
import { toast } from "sonner";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  role?: string;
  tags: string[];
  senderName?: string;
  avatar?: string;
  online: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface Message {
  id: number;
  text?: string;
  file?: string;
  type: "text" | "image" | "audio" | "file";
  mediaType?: string;
  fileName?: string;
  mimetype?: string;
  sender: "me" | "other";
  timestamp: string;
  messageId?: string;
  createdAt?: string;
}

interface MessageDTO {
  id: string;
  conversationId: string;
  customerNumber: string;
  sellerNumber: string;
  managerNumber: string;
  messageId: string;
  sender: "customer" | "manager";
  messageType: string;
  text?: string;
  mediaType?: string;
  fileName?: string;
  pushName?: string;
  createdAt: string;
}

interface ConversationClient {
  id: string;
  customerNumber: string;
  sellerNumber: string;
  managerNumber: string;
  createdAt: string;
}

interface MessageClient {
  conversationId: string;
  customerNumber: string;
  sellerNumber: string;
  managerNumber: string;
  messageId: string;
  sender: string;
  messageType: string;
  text: string;
  mediaType: string;
  rawMessage: string;
  pushName: string;
  messageTimestamp: string;
  mimetype: any;
  fileName: any;
  quotedMessageId: any;
  managerForwardedMessageId: any;
  id: string;
  createdAt: string;
}

interface MessageDTOClient {
  conversation: ConversationClient;
  message: MessageClient;
  type: string;
}

type SocketPayload = MessageDTO | MessageDTOClient;

interface MessagesResponse {
  success: boolean;
  conversation: {
    id: string;
    customerNumber: string;
    sellerNumber: string;
    managerNumber: string;
  };
  messages: MessageDTO[];
  count: number;
}

const mapServerMessage = (msg: MessageDTO | MessageClient): Message => {
  const createdAtValue = "messageTimestamp" in msg ? msg.createdAt : msg.createdAt;
  const createdAt = dayjs(createdAtValue || "").toDate();

  const timestamp = Number.isNaN(createdAt.getTime())
    ? createdAtValue || ""
    : createdAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  const mediaType = msg.mediaType || msg.messageType;
  const hasText = Boolean(msg.text);

  return {
    id: Number(msg.id) || Date.now(),
    messageId: msg.messageId || msg.id,
    text: msg.text,
    file: msg.fileName,
    mediaType: msg.mediaType,
    fileName: msg.fileName,
    mimetype: msg["mimetype"],
    type: hasText || !mediaType
      ? "text"
      : mediaType === "audio"
      ? "audio"
      : mediaType === "image"
      ? "image"
      : "file",
    sender:
      msg.sender === "manager" || msg.sender === "manager"
        ? "me"
        : "other",
    timestamp,
    createdAt: createdAtValue,
  };
};

const sortMessagesChronologically = (msgs: Message[]) =>
  msgs
    .slice()
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
      return ta - tb;
    });

const makeContactFromConversation = (
  conversation: Conversation
): Contact => ({
  id: conversation.id,
  name: conversation.customerNumber,
  phone: conversation.customerNumber,
  senderName: conversation.senderName,
  tags: [],
  online: false,
});

// SOCKET GLOBAL
let socket: Socket | null = null;

export const useChat = (numberSeller?: string) => {
  const seller =
    sellersData.find((item) => item.phone === numberSeller) ||
    sellersData[0];

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const conversationsRef = useRef<Conversation[]>([]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [selectedContact, setSelectedContact] =
    useState<Contact | null>(null);

  const [messagesByConversation, setMessagesByConversation] =
    useState<Record<string, Message[]>>({});

  const [typing, setTyping] = useState(false);
  const fetchConversations = async () => {
    try {
      const url = `${seller.urlApi}/conversations`;

      const response = await axios.get<{
        success: boolean;
        data: Conversation[];
        count: number;
      }>(url);

      const data = response.data.data || [];

      setConversations(data);

      setSelectedConversation((prev) => {
        if (prev) {
          return (
            data.find((c) => c.id === prev.id) ??
            null
          );
        }

        return data.length > 0 ? data[0] : null;
      });
    } catch (error) {
      console.error("Error loading conversations:", error);

      setConversations([]);
      setSelectedConversation(null);
    }
  };
  const fetchMessages = async () => {
    try {
      const url = `${seller.urlApi}/conversations/${selectedConversation?.customerNumber}/messages`;

      const response =
        await axios.get<MessagesResponse>(url);

      const mapped = sortMessagesChronologically(
        (response.data.messages || []).map(mapServerMessage)
      );

      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedConversation?.id || ""]: mapped,
      }));
    } catch (error) {
      console.error("Error loading messages:", error);

      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedConversation?.id || ""]: [],
      }));
    }
  };

  // =====================================================
  // CONTACTO
  // =====================================================

  useEffect(() => {
    setSelectedContact(
      selectedConversation
        ? makeContactFromConversation(selectedConversation)
        : null
    );
  }, [selectedConversation]);

  // =====================================================
  // CONVERSACIONES
  // =====================================================

  useEffect(() => {

    fetchConversations();
  }, [seller.urlApi]);

  // =====================================================
  // MENSAJES
  // =====================================================

  useEffect(() => {
    if (!selectedConversation) return;

    if (messagesByConversation[selectedConversation.id]) return;


    fetchMessages();
  }, [selectedConversation, seller.urlApi]);

  // =====================================================
  // WEBSOCKET REALTIME
  // =====================================================

  useEffect(() => {
    try {
      const origin = new URL(seller.urlApi).origin;

      // always recreate socket for this seller origin
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      socket = io(origin, { transports: ["websocket"] });
      console.log("Socket connected ->", origin);

      const handleMessage = (payload: SocketPayload) => {
        const message = "message" in payload ? payload.message : payload;
        const customerNumber = "conversation" in payload
          ? payload.conversation.customerNumber
          : payload.customerNumber;

        const mappedMessage = mapServerMessage(message);

        setMessagesByConversation((prev) => {
          const conversation = conversationsRef.current.find(
            (c) => c.customerNumber === customerNumber
          );

          if (!conversation) return prev;
          const conversationId = conversation.id;
          const currentMessages = prev[conversationId] || [];

          const exists = currentMessages.some(
            (m) => m.messageId && mappedMessage.messageId && m.messageId === mappedMessage.messageId
          );

          if (exists) return prev;

          return {
            ...prev,
            [conversationId]: sortMessagesChronologically([
              ...currentMessages,
              mappedMessage,
            ]),
          };
        });
      };

      socket.on("message", handleMessage);
      socket.on("new_message", handleMessage);

      return () => {
        socket?.off("message", handleMessage);
        socket?.off("new_message", handleMessage);
        socket?.disconnect();
        socket = null;
      };
    } catch (err) {
      console.error("Socket init error:", err);
    }
  }, [seller.urlApi]);

  // =====================================================
  // MENSAJES ACTUALES
  // =====================================================

  const messages = selectedConversation
    ? messagesByConversation[selectedConversation.id] || []
    : [];

  // =====================================================
  // ENVIAR MENSAJE
  // =====================================================

  const sendMessage = async (text: string) => {
    if (!selectedConversation) return;

    const payload = {
      conversationId: selectedConversation.id,
      customerNumber:
        selectedConversation.customerNumber,
      text: text || undefined,
      mediaType: undefined,
      mediaBase64: undefined,
      fileName: undefined,
      caption: undefined,
    };

    try {
      await axios.post(
        `${seller.urlApi}/messages/send`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      fetchMessages();
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // OPTIMISTIC UPDATE
    const optimistic: Message = {
      id: Date.now(),
      messageId: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      text,
      type: "text",
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConversation.id]: sortMessagesChronologically([
        ...(prev[selectedConversation.id] || []),
        optimistic,
      ]),
    }));
  };

  // =====================================================
  // ENVIAR ARCHIVO
  // =====================================================

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const sendFile = async (file: File) => {
    if (!selectedConversation) return;
    const toastId = toast.loading("Enviando archivo...");
    const mediaBase64 = await fileToBase64(file);
    const mediaType = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("audio")
      ? "audio"
      : "file";

    const payload = {
      conversationId: selectedConversation.id,
      customerNumber: selectedConversation.customerNumber,
      text: undefined,
      mediaType,
      mediaBase64,
      fileName: file.name,
      caption: undefined,
    };

    try {
      await axios.post(`${seller.urlApi}/messages/send`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      fetchMessages();
      fetchConversations();
      toast.success("Archivo enviado!", { id: toastId });
    } catch (error) {
      console.error("Error sending file:", error);
      toast.error("Error enviando archivo!", { id: toastId });
    } finally {
      setTimeout(() => toast.dismiss(toastId), 4000);
    }

    const localUrl = URL.createObjectURL(file);
    const optimisticFile: Message = {
      id: Date.now(),
      messageId: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      file: localUrl,
      type: mediaType === "file" ? "image" : mediaType,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConversation.id]: sortMessagesChronologically([
        ...(prev[selectedConversation.id] || []),
        optimisticFile,
      ]),
    }));
  };

  return {
    seller,
    conversations,
    selectedConversation,
    setSelectedConversation,
    selectedContact,
    messages,
    sendMessage,
    sendFile,
    typing,
  };
};
