import { Injectable } from '@nestjs/common';
import { SessionsRepository } from '../../04-repositories/sessions-repository';

@Injectable()
export class DeleteSessionByDeviceIdUseCase {
    constructor(private sessionsRepository: SessionsRepository) {}

    async execute(deviceId: string): Promise<boolean> {
        return await this.sessionsRepository.deleteSessionByDeviceId(deviceId);
    }
}
