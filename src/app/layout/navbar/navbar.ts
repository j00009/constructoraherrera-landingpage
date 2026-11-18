import { Component, signal, inject } from '@angular/core';
import { EmpresaService } from '../../core/services/empresa.service';
import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-navbar',
  imports: [IconComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  readonly empresa = inject(EmpresaService).empresa;
  readonly menuOpen = signal(false);

  toggleMenu(): void { this.menuOpen.update(open => !open); }
  closeMenu(): void { this.menuOpen.set(false); }
}
