import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware';
import { assertRequiredString, sanitizeText } from '../validation/validators';
import { MessageService } from './message.service';

function parseNumber(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  sendInquiry = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const propertyId = assertRequiredString(req.body?.propertyId, 'propertyId');
    const body = sanitizeText(assertRequiredString(req.body?.body, 'body'));
    const subject = typeof req.body?.subject === 'string' ? sanitizeText(req.body.subject) : undefined;

    const message = await this.messageService.sendInquiry({
      propertyId,
      senderId: req.user.id,
      subject,
      body,
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully.',
      data: message,
    });
  };

  adminView = async (req: AuthenticatedRequest, res: Response) => {
    const data = await this.messageService.listAdminMessages({
      page: parseNumber(req.query.page),
      pageSize: parseNumber(req.query.pageSize),
      isRead:
        req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
    });

    return res.status(200).json({
      success: true,
      ...data,
    });
  };

  markReadStatus = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const isRead = req.body?.isRead === false ? false : true;

    await this.messageService.markAsRead(id, isRead);

    return res.status(200).json({
      success: true,
      message: 'Message status updated.',
    });
  };
}
