import { Component, inject } from '@angular/core';
import { EmpresaService } from '../../core/services/empresa.service';
import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-whatsapp-fab',
  imports: [IconComponent],
  templateUrl: './whatsapp-fab.html',
  styleUrl: './whatsapp-fab.css'
})
export class WhatsappFabComponent {
  readonly empresa = inject(EmpresaService).empresa;
}
