import { BalanceDto } from "./balance-dto.model"
import { Balance } from "./balance.model"


export class BalanceMapper {

    public static toBalance(balanceDto: BalanceDto): Balance {
        return {
            balanceTotal: balanceDto.balance_total,
            available: balanceDto.available,
            currency: balanceDto.currency,
            income: balanceDto.income,
            outcome: balanceDto.outcome
        }
    }

    public static toBalanceDto(balance: Balance): BalanceDto {
        return {
            balance_total: balance.balanceTotal,
            available: balance.available,
            currency: balance.currency,
            income: balance.income,
            outcome: balance.outcome
        }
    }
}