import { SupabaseProfileDto } from "./user-dto.model";
import { User } from "./user.model";


export class UserMapper {

    static toDomain(dto: SupabaseProfileDto) : User {

        return {

            id: dto.id,
            email: dto.email,
            username: dto.user_name,
            name: dto.full_name,
            avatarUrl: dto.avatar_url ?? undefined,
        }
    }

    static toDto(domain: Partial<User>) : Partial<SupabaseProfileDto> {

        return {

            id: domain.id,
            email: domain.email,
            user_name: domain.username,
            full_name: domain.name,
            avatar_url: domain.avatarUrl ?? null,
        }
    }
}