import { Component, inject } from '@angular/core';
import { EmpresaService } from '../../core/services/empresa.service';
import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-footer',
  imports: [IconComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  readonly empresa = inject(EmpresaService).empresa;
  readonly year = new Date().getFullYear();
}
