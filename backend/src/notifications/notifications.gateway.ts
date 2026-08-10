import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@Injectable()
export class NotificationsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);
  private secret: string;

  constructor(private jwtService: JwtService, private config: ConfigService) {
    this.secret = this.config.get<string>('JWT_ACCESS_SECRET') as string;
  }

  afterInit() {
    this.server.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        next(new UnauthorizedException('Token JWT ausente')); 
        return;
      }

      try {
        const payload = this.jwtService.verify(token, { secret: this.secret }) as any;
        socket.data.user = { id: payload.sub, email: payload.email, role: payload.role };
        socket.join(`user:${payload.sub}`);
        next();
      } catch (error) {
        next(new UnauthorizedException('Token JWT inválido')); 
      }
    });
  }

  notifyTaskReassigned(userId: string, taskId: string, title: string) {
    this.server.to(`user:${userId}`).emit('task:reassigned', {
      taskId,
      title,
      message: `A tarefa '${title}' foi reatribuída para você`,
    });
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any) {
    return { event: 'pong', data };
  }
}
