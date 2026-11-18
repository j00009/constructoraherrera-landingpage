import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactoSolicitud } from '../models/contacto.model';

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private readonly http = inject(HttpClient);

  enviar(solicitud: ContactoSolicitud): Observable<unknown> {
    return this.http.post(environment.contactoUrl, solicitud);
  }
}
