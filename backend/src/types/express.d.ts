// 타입 확장
export {};

declare global {
    namespace Express {
        interface User {
            id: number;
            email: string;
            name: string | null;
            role: string;
        }

        interface Request {
            user?: User;
        }
    }
}
