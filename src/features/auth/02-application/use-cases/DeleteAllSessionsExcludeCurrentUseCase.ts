import { SessionsRepository } from '../../04-repositories/sessions-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class DeleteAllSessionsExcludeCurrentCommand {
    constructor(
        public currentUserId: string,
        public currentDeviceId: string,
    ) {}
}
@CommandHandler(DeleteAllSessionsExcludeCurrentCommand)
export class DeleteAllSessionsExcludeCurrentUseCase implements ICommandHandler<DeleteAllSessionsExcludeCurrentCommand> {
    constructor(private sessionsRepository: SessionsRepository) {}

    async execute(command: DeleteAllSessionsExcludeCurrentCommand): Promise<boolean> {
        return await this.sessionsRepository.deleteAllSessionsExcludeCurrent(
            command.currentUserId,
            command.currentDeviceId,
        );
    }
}
