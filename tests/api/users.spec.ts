import { test, expect } from "@playwright/test";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface UserResponse {
  data: User;
}

test.describe('GET /users/:id', ()=>{
    test('deve retornar 200 e os dados corretos do usuário quando o ID existe', async ({ request }) =>{
        const user_id = 2
        const status = 200
        const email = 'janet.weaver@reqres.in'
        const first_name = 'Janet'
        const last_name = 'Weaver'
        const response = await request.get
        (
            `users/${user_id}`,
        )

        expect(response.status()).toBe(status);
        const body: UserResponse = await response.json();
        expect(body.data.id).toBe(user_id);
        expect(body.data.email).toBe(email);
        expect(body.data.first_name).toBe(first_name);
        expect(body.data.last_name).toBe(last_name);
    });
});