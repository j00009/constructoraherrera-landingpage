import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmpresaService } from '../../../core/services/empresa.service';
import { ContactoService } from '../../../core/services/contacto.service';

@Component({ selector: 'app-contact-form', imports: [ReactiveFormsModule], templateUrl: './contact-form.html', styleUrl: './contact-form.css' })
export class ContactFormComponent {
    private readonly fb = inject(FormBuilder);
    private readonly contacto = inject(ContactoService);
    readonly empresa = inject(EmpresaService).empresa;
    readonly enviado = signal(false);
    readonly enviando = signal(false);
    readonly estado = signal('');

    readonly form = this.fb.nonNullable.group({
        nombre: ['', [Validators.required]], correo: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required]], servicio: ['', [Validators.required]],
        ubicacion: [''], mensaje: ['', [Validators.required]]
    });

    submit(): void {
        this.estado.set('');
        if (this.form.invalid) {
            const controls = this.form.controls;
            for (const key of ['nombre', 'correo', 'telefono', 'servicio', 'mensaje'] as const) {
                if (controls[key].invalid) { controls[key].markAsTouched(); const el = document.querySelector<HTMLElement>(`#${key}`); el?.focus(); break; }
            }
            return;
        }
        const telefono = this.form.controls.telefono.value.replace(/\D/g, '');
        if (telefono.length < 8) {
            this.form.controls.telefono.markAsTouched(); document.querySelector<HTMLElement>('#telefono')?.focus(); return;
        }
        this.enviando.set(true);
        this.contacto.enviar(this.form.getRawValue()).pipe(finalize(() => this.enviando.set(false))).subscribe({
            next: () => { this.enviado.set(true); this.estado.set('Solicitud enviada correctamente.'); this.form.reset(); },
            error: () => { this.enviado.set(false); this.estado.set('No fue posible enviar la solicitud. Inténtelo nuevamente.'); }
        });
    }

    readonly mensajes = {
        nombre: 'Escriba su nombre.', correo: 'Ingrese un correo válido, por ejemplo nombre@correo.cl.',
        telefono: 'Ingrese un teléfono de contacto, por ejemplo +56 9 1234 5678.', servicio: 'Elija el tipo de trabajo.', mensaje: 'Cuéntenos brevemente qué necesita.'
    } as const;
}
