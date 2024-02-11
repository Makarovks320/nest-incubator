import { Injectable } from '@nestjs/common';
import { SessionsRepository } from '../../04-repositories/sessions-repository';

@Injectable()
export class DeleteAllSessionsExcludeCurrentUseCase {
    constructor(private sessionsRepository: SessionsRepository) {}

    async execute(currentUserId: string, currentDeviceId: string): Promise<boolean> {
        return await this.sessionsRepository.deleteAllSessionsExcludeCurrent(currentUserId, currentDeviceId);
    }
}
