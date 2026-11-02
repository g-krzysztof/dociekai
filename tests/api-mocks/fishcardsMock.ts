import type { Page } from '@playwright/test';

export async function mockFishcards(page: Page) {
  await page.route('**/api/fishcards', async route => {
    const json = {
      "data": [
        {
          "id": 3,
          "documentId": "qwhrvc58dos325o2zktnley7",
          "name": "Dni tygodnia",
          "description": null,
          "category": "Podstawowe",
          "difficulty": "beginner",
          "createdAt": "2025-09-28T21:04:48.011Z",
          "updatedAt": "2025-10-09T07:21:20.356Z",
          "publishedAt": null,
          "jsonData": [
            { "id": 1, "polish": "w poniedziałek", "english": "on Monday", "learned": false },
            { "id": 2, "polish": "we wtorek", "english": "on Tuesday", "learned": false },
            { "id": 3, "polish": "w środę", "english": "on Wednesday", "learned": false },
            { "id": 4, "polish": "w czwartek", "english": "on Thursday", "learned": false },
            { "id": 5, "polish": "w piątek", "english": "on Friday", "learned": false },
            { "id": 6, "polish": "w sobotę", "english": "on Saturday", "learned": false },
            { "id": 7, "polish": "w niedzielę", "english": "on Sunday", "learned": false }
          ]
        },
        {
          "id": 12,
          "documentId": "oruu38w6x8jgjykgncgv72k6",
          "name": "Pory dnia",
          "description": "wraz z dniem tygodnia",
          "category": "Podstawowe",
          "difficulty": "intermediate",
          "createdAt": "2025-10-06T08:39:22.011Z",
          "updatedAt": "2025-10-09T08:39:37.671Z",
          "publishedAt": null,
          "jsonData": [
            { "id": 1, "polish": "rano", "english": "in the morning", "learned": false },
            { "id": 2, "polish": "po południu", "english": "in the afternoon", "learned": false },
            { "id": 3, "polish": "wieczorem", "english": "in the evening", "learned": false },
            { "id": 4, "polish": "w południe", "english": "at noon", "learned": false },
            { "id": 6, "polish": "o północy", "english": "at midnight", "learned": false },
            { "id": 7, "polish": "w nocy", "english": "at night", "learned": false }
          ]
        },
        {
          "id": 17,
          "documentId": "axx8xipc9u5ti1ks0bfi6j3u",
          "name": "Kierunki świata",
          "description": null,
          "category": "Podstawowe",
          "difficulty": "beginner",
          "createdAt": "2025-10-13T07:00:28.600Z",
          "updatedAt": "2025-10-13T10:14:19.197Z",
          "publishedAt": null,
          "jsonData": [
            { "id": 1, "polish": "północ", "english": "north", "learned": false },
            { "id": 2, "polish": "południe", "english": "south", "learned": false },
            { "id": 3, "polish": "wschód", "english": "east", "learned": false },
            { "id": 4, "polish": "zachód", "english": "west", "learned": false }
          ]
        }
      ]
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
}

export default mockFishcards;
