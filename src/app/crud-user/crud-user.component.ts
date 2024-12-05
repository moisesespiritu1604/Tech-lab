import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.model';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-crud-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crud-user.component.html',
  styleUrl: './crud-user.component.css',
})
export class CrudUserComponent implements OnInit {
  users: User[] = [];
  paginatedUsers: User[] = [];
  filteredUsers: User[] = [];
  searchResults: User[] = []; 
  userForm: FormGroup;
  isEditing = false;
  showConfirmModal: boolean = false; 
  userToDelete: User | null = null; 
  showAddEditModal: boolean = false; 


  // Variables para la paginación
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 0;

  // Variable para el término de búsqueda
  searchQuery: string = '';

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.userForm = this.fb.group({
      id: [null], 
      name: [''], 
      email: [''],
      role: [''], 
      avatar: [''], 
      password: [''], 
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.apiService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.searchResults = [...this.users];
        this.updatePagination();
      },
      error: (err) => console.error('Error fetching users:', err),
    });
  }

  // Actualiza los usuarios visibles en la tabla según la página actual
  updatePagination(): void {
    this.totalPages = Math.ceil(this.searchResults.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
  
    this.paginatedUsers = this.searchResults.slice(startIndex, endIndex);
    this.filteredUsers = [...this.paginatedUsers]; 
  }
  
  

  // Maneja el buscador
  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
  
    if (query === '') {
      this.searchResults = [...this.users];
    } else {
      this.searchResults = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }
  
  // Navega a la página especificada
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // Navega a la página siguiente
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Navega a la página anterior
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  onEdit(user: User): void {
    this.isEditing = true; 
    this.userForm.patchValue(user);
  }

  onDelete(id: number | undefined): void {
    if (!id) return;
  
    this.apiService.deleteUser(id).subscribe({
      next: () => {
        this.fetchUsers(); 
        this.closeModal(); 
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.closeModal();
      },
    });
  }
  

  onSave(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
  
      if (this.isEditing) {
        // Intenta actualizar en el backend
        this.apiService.updateUser(userData.id, userData).subscribe({
          next: () => {
            console.log('User updated successfully on the server.');
            this.fetchUsers(); 
            this.closeModal(); 
          },
          error: (err) => {
            console.error('Error updating user on the server:', err);
  
            // Si el usuario no se puede actualizar en el backend, mantén la edición local
            const index = this.users.findIndex((u) => u.id === userData.id);
            if (index !== -1) {
              console.warn(
                `Could not update user with ID ${userData.id} on the server. Changes will only persist locally.`
              );
              this.users[index] = { ...this.users[index], ...userData }; 
              this.updatePagination(); 
            }
            this.closeModal();
          },
        });
      } else {
        // Crear un nuevo usuario
        if (!userData.password) {
          userData.password = 'defaultPassword123'; 
        }
  
        this.apiService.createUser(userData).subscribe({
          next: (newUser) => {
            console.log('User created successfully on the server.');
            this.users.push(newUser); 
            this.updatePagination(); 
            this.closeModal(); 
          },
          error: (err) => {
            console.error('Error creating user on the server:', err);
          },
        });
      }
    } else {
      console.error('Formulario inválido. Asegúrate de llenar todos los campos requeridos.');
    }
  }
  
  openModal(action: 'add' | 'edit', user?: User): void {
    this.showAddEditModal = true;
    if (action === 'edit' && user) {
      this.isEditing = true;
      this.userForm.patchValue(user);
    } else {
      this.isEditing = false;
      this.userForm.reset();
    }
  }
  
  confirmDelete(user: User): void {
    this.userToDelete = user; 
    this.showConfirmModal = true; 
  }
  
  closeModal(): void {
    this.userToDelete = null; 
    this.showConfirmModal = false; 
    this.showAddEditModal = false;
    this.isEditing = false;
    this.userForm.reset();
  }
  
  
  cancel(): void {
    this.userForm.reset(); 
    this.isEditing = false; 
  }
}
