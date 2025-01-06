import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/authorisation',
      name: 'authorisation',
      component: () => import('../views/AuthorisationView.vue'),
    },
    {
      path: '/tutorial',
      name: 'tutorial',
      component: () => import('../views/TutorialView.vue'),
    },
  ],
});

export default router;
