import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
        nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        correo: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
        telefono: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^(?=(?:\D*\d){8,}).+$/)]],
        servicio: ['', [Validators.required]],
        ubicacion: ['', [Validators.maxLength(100)]],
        mensaje: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]]
    });

    submit(): void {
        this.estado.set('');
        if (this.form.invalid) {
            const controls = this.form.controls;
            for (const key of ['nombre', 'correo', 'telefono', 'servicio', 'ubicacion', 'mensaje'] as const) {
                if (controls[key].invalid) { controls[key].markAsTouched(); const el = document.querySelector<HTMLElement>(`#${key}`); el?.focus(); break; }
            }
            return;
        }
        this.enviando.set(true);
        this.contacto.enviar(this.form.getRawValue()).pipe(finalize(() => this.enviando.set(false))).subscribe({
            next: () => { this.enviado.set(true); this.estado.set('Solicitud enviada correctamente.'); this.form.reset(); },
            error: (error: unknown) => {
                this.enviado.set(false);
                const apiMessage = error instanceof HttpErrorResponse
                    ? (error.error as { message?: unknown } | null)?.message
                    : undefined;
                this.estado.set(typeof apiMessage === 'string'
                    ? apiMessage
                    : 'No fue posible enviar la solicitud. Inténtelo nuevamente.');
            }
        });
    }

    readonly mensajes = {
        nombre: 'Ingrese al menos 2 caracteres y hasta 100.',
        correo: 'Ingrese un correo válido de hasta 254 caracteres, por ejemplo nombre@correo.cl.',
        telefono: 'Ingrese un teléfono con al menos 8 dígitos y hasta 30 caracteres.',
        servicio: 'Elija el tipo de trabajo.',
        ubicacion: 'La comuna puede tener hasta 100 caracteres.',
        mensaje: 'Escriba al menos 10 caracteres y hasta 5000.'
    } as const;
}
