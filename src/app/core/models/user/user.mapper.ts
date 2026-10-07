import { SupabaseProfileDto } from "./user-dto.model";
import { User } from "./user.model";


export class UserMapper {

    static toDomain(dto: SupabaseProfileDto) : User {

        return {

            id: dto.id,
            email: dto.email,
            name: dto.full_name,
            avatarUrl: dto.avatar_url ?? undefined,
            createdAt: new Date(dto.created_at),
        }
    }

    static toDto(domain: Partial<User>) : Partial<SupabaseProfileDto> {

        return {

            id: domain.id,
            email: domain.email,
            full_name: domain.name,
            avatar_url: domain.avatarUrl ?? null,
        }
    }
}