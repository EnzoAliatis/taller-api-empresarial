import { PUBLIC_API_URL } from '$env/static/public';

/** Forma de un empleado tal como lo devuelve el backend. */
export interface Empleado {
	id: string;
	nombre: string;
	cargo: string;
	departamento: string;
	sueldo: number;
}

export type EmpleadoInput = Omit<Empleado, 'id'>;

/** Response Wrapper del backend: `{ success, data }` o `{ success, error }`. */
type Respuesta<T> =
	| { success: true; data: T }
	| {
			success: false;
			error: { mensaje: string; detalles?: { campo: string; mensaje: string }[] };
	  };

const BASE = `${PUBLIC_API_URL}/api/v1/empleados`;

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, {
		...init,
		headers: { 'Content-Type': 'application/json' }
	});
	const json: Respuesta<T> = await res.json();

	if (!json.success) {
		const detalles = json.error.detalles?.map((d) => d.mensaje).join(', ');
		throw new Error(detalles ? `${json.error.mensaje}: ${detalles}` : json.error.mensaje);
	}
	return json.data;
}

export const listar = () => pedir<Empleado[]>(BASE);

export const crear = (datos: EmpleadoInput) =>
	pedir<Empleado>(BASE, { method: 'POST', body: JSON.stringify(datos) });

export const actualizar = (id: string, datos: Partial<EmpleadoInput>) =>
	pedir<Empleado>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(datos) });

export const eliminar = (id: string) => pedir<{ id: string }>(`${BASE}/${id}`, { method: 'DELETE' });
