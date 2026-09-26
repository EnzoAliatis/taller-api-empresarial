<script lang="ts">
	import { onMount } from 'svelte';
	import { actualizar, crear, eliminar, listar, type Empleado, type EmpleadoInput } from '$lib/api';

	const vacio = (): EmpleadoInput => ({ nombre: '', cargo: '', departamento: '', sueldo: 0 });

	let empleados = $state<Empleado[]>([]);
	let nuevo = $state(vacio());
	let editandoId = $state<string | null>(null);
	let edicion = $state(vacio());
	let cargando = $state(true);
	let error = $state('');

	const moneda = new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' });

	/** Ejecuta una acción contra la API y muestra el error si falla. */
	async function intentar(accion: () => Promise<void>) {
		error = '';
		try {
			await accion();
		} catch (e) {
			error = e instanceof Error ? e.message : 'No se pudo conectar con la API';
		}
	}

	onMount(() => intentar(async () => {
		empleados = await listar();
	}).finally(() => (cargando = false)));

	const guardarNuevo = (e: SubmitEvent) => {
		e.preventDefault();
		return intentar(async () => {
			empleados.push(await crear(nuevo));
			nuevo = vacio();
		});
	};

	function editar(emp: Empleado) {
		editandoId = emp.id;
		edicion = { nombre: emp.nombre, cargo: emp.cargo, departamento: emp.departamento, sueldo: emp.sueldo };
	}

	const guardarEdicion = (id: string) =>
		intentar(async () => {
			const actualizado = await actualizar(id, edicion);
			empleados = empleados.map((emp) => (emp.id === id ? actualizado : emp));
			editandoId = null;
		});

	const borrar = (emp: Empleado) => {
		if (!confirm(`¿Eliminar a ${emp.nombre}?`)) return;
		return intentar(async () => {
			await eliminar(emp.id);
			empleados = empleados.filter((x) => x.id !== emp.id);
		});
	};
</script>

<h1>Empleados</h1>

{#if error}
	<article class="error">{error}</article>
{/if}

<article>
	<header><strong>Nuevo empleado</strong></header>
	<form onsubmit={guardarNuevo}>
		<div class="grid">
			<input placeholder="Nombre" bind:value={nuevo.nombre} required minlength="3" />
			<input placeholder="Cargo" bind:value={nuevo.cargo} required minlength="3" />
			<input placeholder="Departamento" bind:value={nuevo.departamento} required minlength="2" />
			<input type="number" placeholder="Sueldo" bind:value={nuevo.sueldo} required min="0.01" step="0.01" />
		</div>
		<button type="submit">Crear</button>
	</form>
</article>

{#if cargando}
	<p aria-busy="true">Cargando empleados…</p>
{:else if empleados.length === 0}
	<p>No hay empleados registrados.</p>
{:else}
	<div class="overflow-auto">
		<table class="striped">
			<thead>
				<tr>
					<th>Nombre</th>
					<th>Cargo</th>
					<th>Departamento</th>
					<th>Sueldo</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each empleados as emp (emp.id)}
					{#if editandoId === emp.id}
						<tr>
							<td><input bind:value={edicion.nombre} /></td>
							<td><input bind:value={edicion.cargo} /></td>
							<td><input bind:value={edicion.departamento} /></td>
							<td><input type="number" step="0.01" bind:value={edicion.sueldo} /></td>
							<td class="acciones">
								<button onclick={() => guardarEdicion(emp.id)}>Guardar</button>
								<button class="secondary outline" onclick={() => (editandoId = null)}>Cancelar</button>
							</td>
						</tr>
					{:else}
						<tr>
							<td>{emp.nombre}</td>
							<td>{emp.cargo}</td>
							<td>{emp.departamento}</td>
							<td>{moneda.format(emp.sueldo)}</td>
							<td class="acciones">
								<button class="outline" onclick={() => editar(emp)}>Editar</button>
								<button class="contrast outline" onclick={() => borrar(emp)}>Eliminar</button>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	h1 {
		margin-top: 2rem;
	}
	.error {
		color: var(--pico-del-color);
	}
	.acciones {
		white-space: nowrap;
		text-align: right;
	}
	.acciones button {
		padding: 0.3rem 0.8rem;
		margin: 0 0 0 0.3rem;
	}
	td input {
		margin: 0;
		padding: 0.3rem 0.5rem;
		height: auto;
	}
</style>
