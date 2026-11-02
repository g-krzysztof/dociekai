import type { Page } from '@playwright/test';

export async function mockLogin(page: Page) {
  await page.route('**/api/auth/login', async route => {
    const json = {
      "message": "Zalogowano pomyślnie",
      "user": {
        "id": 3,
        "documentId": "test-document-id-0000000",
        "username": "test-user",
        "email": "test.user@example.com",
        "provider": "local",
        "resetPasswordToken": null,
        "confirmationToken": null,
        "confirmed": true,
        "blocked": false,
        "createdAt": "2025-09-06T12:56:30.440Z",
        "updatedAt": "2025-09-07T22:03:53.118Z",
        "publishedAt": "2025-09-06T12:56:30.441Z",
        "locale": null,
        "firstName": "Jan",
        "lastName": "Testowy",
        "phone": "000000000",
        "resetPasswordExpires": null,
        "lastLoginAt": null,
        "registrationDate": "2025-09-04T12:00:00.000Z",
        "role": { "name": "Authenticated", "type": "authenticated" }
      },
      "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.ZmFrZS1zaWduYXR1cmU"
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
}

export default mockLogin;
