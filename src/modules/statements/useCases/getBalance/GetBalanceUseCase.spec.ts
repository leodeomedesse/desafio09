import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: IStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("GetBalanceUseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("should be able to get the user balance", async () => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test@email.com",
      password: "123"
    });

    const statementDeposit = await inMemoryStatementsRepository.create({
      amount: 100,
      description: "deposit",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const statementWithdraw = await inMemoryStatementsRepository.create({
      amount: 50,
      description: "withdraw",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response).toStrictEqual({
      statement: [statementDeposit, statementWithdraw],
      balance: 50,
    });
  });

  it("should not be able to get the account balance from a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "inexistentId"
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
