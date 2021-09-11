import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    private readonly a = 1;

    display(text: string) {
        return text;
    }
}
