import { SessionsRepository } from '../../04-repositories/sessions-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteSessionByDeviceIdCommand {
    constructor(public deviceId: string) {}
}
@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase implements ICommandHandler<DeleteSessionByDeviceIdCommand> {
    constructor(private sessionsRepository: SessionsRepository) {}

    async execute(command: DeleteSessionByDeviceIdCommand): Promise<boolean> {
        return await this.sessionsRepository.deleteSessionByDeviceId(command.deviceId);
    }
}
