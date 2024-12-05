import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/crud-user', pathMatch: 'full' },

    {
        path: 'crud-user',
        title: 'CRUD-USER',
        loadComponent: () =>
        import('./crud-user/crud-user.component').then(m => m.CrudUserComponent)
    },

    { path: '**', redirectTo: '/crud-user', pathMatch: 'full' }
];
