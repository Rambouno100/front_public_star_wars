import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X, MapPin } from 'lucide-react';
import client from '../../../shared/api/client';

/* ── Design tokens ────────────────────────────────────────────── */
const PANEL    = 'var(--bg-panel)';
const HAIRLINE = 'var(--hairline)';
const HAIRLINE_STRONG = 'var(--hairline-strong)';
const CREAM    = 'var(--color-cream)';
const MUTED    = 'var(--color-muted)';
const FAINT    = 'var(--color-faint)';
const ACCENT   = 'var(--accent)';

const fMono = "'Space Mono', ui-monospace, Menlo, monospace";
const fBody = "'Inter', system-ui, sans-serif";

const labelSt = {
  fontFamily: fMono, fontSize: 10, fontWeight: 400,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: FAINT, display: 'block', marginBottom: 10,
};
const inputSt = {
  width: '100%', background: 'transparent', border: 'none',
  borderBottom: `1px solid ${HAIRLINE_STRONG}`,
  padding: '10px 0', fontFamily: fBody, fontSize: 14, color: CREAM,
  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
};
const selectSt = {
  ...inputSt, appearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23F5F5F0' stroke-opacity='0.45' stroke-width='1.2' stroke-linecap='square'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', paddingRight: 24,
};

const focus = e => { e.target.style.borderBottomColor = ACCENT; };
const blur  = e => { e.target.style.borderBottomColor = HAIRLINE_STRONG; };

const norm = s => (s ?? '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const EMPTY = { nombre: '', direccion: '', referencia: '', telefono: '', department: '', province: '', district: '' };

const MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

const DireccionEnvio = ({ onDireccionSeleccionada }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [selected, setSelected] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [nueva, setNueva] = useState(EMPTY);
  const [ubigeos, setUbigeos] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mapsReady, setMapsReady] = useState(false);

  const dirInputRef = useRef(null);
  const acRef = useRef(null);

  /* ── Cargar datos ──────────────────────────────────────────── */
  // Direcciones y ubigeos se cargan en paralelo pero independientes:
  // el <select> de direcciones no debe esperar a /ubigeos/ (que trae ~1.8k filas).
  useEffect(() => {
    client.get('/direcciones/').then(({ data }) => {
      setDirecciones(data);
      // Auto-seleccionar si solo hay una dirección
      if (data.length === 1) {
        const id = String(data[0].id);
        setSelected(id);
        onDireccionSeleccionada(id, data[0]);
      }
    }).catch(() => {});
    client.get('/ubigeos/').then(({ data }) => {
      setUbigeos(data);
      setDepartments([...new Set(data.map(x => x.department))].sort());
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Cargar script de Google Maps ─────────────────────────── */
  useEffect(() => {
    if (!MAPS_KEY) return;
    if (window.google?.maps?.places) { setMapsReady(true); return; }
    const cb = '__gmapsCb';
    window[cb] = () => setMapsReady(true);
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&callback=${cb}`;
    s.async = true;
    document.head.appendChild(s);
    return () => { delete window[cb]; };
  }, []);

  /* ── Conectar Autocomplete al input ────────────────────────── */
  useEffect(() => {
    if (!mapsReady || !dirInputRef.current || !ubigeos.length) return;

    const ac = new window.google.maps.places.Autocomplete(dirInputRef.current, {
      componentRestrictions: { country: 'pe' },
      fields: ['address_components', 'formatted_address'],
      types: ['address'],
    });

    const get = (components, ...types) =>
      components.find(c => types.some(t => c.types.includes(t)));

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place?.address_components) return;
      const comp = place.address_components;

      const num   = get(comp, 'street_number')?.long_name ?? '';
      const route = get(comp, 'route')?.long_name ?? '';
      const dst   = get(comp, 'administrative_area_level_3', 'sublocality_level_1', 'locality');
      const prv   = get(comp, 'administrative_area_level_2');
      const dpt   = get(comp, 'administrative_area_level_1');

      const addr = route + (num ? ' ' + num : '');
      const dstName = norm(dst?.long_name ?? '');
      const prvName = norm(prv?.long_name ?? '');
      const dptName = norm(dpt?.long_name ?? '');

      // Buscar ubigeo: primero match exacto por los tres niveles, luego solo por distrito
      const match =
        ubigeos.find(u =>
          norm(u.department) === dptName &&
          norm(u.province) === prvName &&
          norm(u.district) === dstName
        ) ??
        ubigeos.find(u =>
          norm(u.department) === dptName && norm(u.district) === dstName
        ) ??
        ubigeos.find(u => norm(u.district) === dstName);

      if (match) {
        const provs = [...new Set(ubigeos.filter(u => u.department === match.department).map(u => u.province))].sort();
        const dists = [...new Set(ubigeos.filter(u => u.department === match.department && u.province === match.province).map(u => u.district))].sort();
        setProvinces(provs);
        setDistricts(dists);
        setNueva(prev => ({
          ...prev,
          direccion: addr || place.formatted_address,
          department: match.department,
          province: match.province,
          district: match.district,
        }));
      } else {
        setNueva(prev => ({ ...prev, direccion: addr || place.formatted_address }));
      }
    });

    acRef.current = ac;
    return () => {
      if (acRef.current) window.google.maps.event.clearInstanceListeners(acRef.current);
    };
  }, [mapsReady, ubigeos]);

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setNueva(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'department') { next.province = ''; next.district = ''; }
      if (name === 'province') { next.district = ''; }
      return next;
    });
    if (name === 'department') {
      setProvinces([...new Set(ubigeos.filter(u => u.department === value).map(u => u.province))].sort());
      setDistricts([]);
    } else if (name === 'province') {
      setDistricts([...new Set(
        ubigeos.filter(u => u.department === nueva.department && u.province === value).map(u => u.district)
      )].sort());
    }
  }, [ubigeos, nueva.department]);

  const guardar = useCallback(async () => {
    const ubigeo = ubigeos.find(u =>
      u.department === nueva.department && u.province === nueva.province && u.district === nueva.district
    );
    if (!ubigeo?.id) return;
    try {
      const { data } = await client.post('/direcciones/', {
        nombre: nueva.nombre || nueva.direccion,
        direccion: nueva.direccion,
        referencia: nueva.referencia,
        telefono: nueva.telefono,
        ubigeo_id: ubigeo.id,
      });
      setDirecciones(prev => [...prev, data]);
      const id = String(data.id);
      setSelected(id);
      onDireccionSeleccionada(id, data);
      setShowForm(false);
      setNueva(EMPTY);
      setProvinces([]); setDistricts([]);
    } catch {}
  }, [nueva, ubigeos, onDireccionSeleccionada]);

  const canSave = nueva.direccion && nueva.district;

  const handleSelect = e => {
    const id = e.target.value;
    setSelected(id);
    const found = direcciones.find(d => String(d.id) === id);
    onDireccionSeleccionada(id, found);
  };

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: fBody, color: CREAM }}>

      {/* Selector de dirección existente */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: showForm ? 24 : 0 }}>
        <div style={{ flex: 1 }}>
          <label style={labelSt}>Dirección guardada</label>
          <select style={selectSt} value={selected} onChange={handleSelect} onFocus={focus} onBlur={blur}>
            <option value="" style={{ background: PANEL, color: MUTED }}>— Selecciona una dirección —</option>
            {direcciones.map(d => (
              <option key={d.id} value={String(d.id)} style={{ background: PANEL, color: CREAM }}>
                {d.direccion}{d.ubigeo ? `, ${d.ubigeo.district}` : ''}
                {d.nombre && d.nombre !== d.direccion ? ` (${d.nombre})` : ''}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', background: 'transparent',
            border: `1px solid ${HAIRLINE_STRONG}`, cursor: 'pointer',
            fontFamily: fMono, fontSize: 11, fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: MUTED, whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = CREAM; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE_STRONG; e.currentTarget.style.color = MUTED; }}
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancelar' : 'Nueva'}
        </button>
      </div>

      {/* Formulario nueva dirección */}
      {showForm && (
        <div style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 28, marginTop: 8 }}>
          <div style={{
            fontFamily: fMono, fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: FAINT, marginBottom: 24,
          }}>
            Nueva dirección
          </div>

          {/* Campo dirección con Maps */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelSt}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={10} />
                Dirección{MAPS_KEY && mapsReady
                  ? ' — empieza a escribir para buscar'
                  : ''}
              </span>
            </label>
            <input
              ref={dirInputRef}
              style={inputSt}
              type="text"
              name="direccion"
              value={nueva.direccion}
              onChange={handleChange}
              placeholder="Av. Arequipa 1234"
              onFocus={focus} onBlur={blur}
              autoComplete="off"
              required
            />
            {MAPS_KEY && mapsReady && (
              <div style={{ fontFamily: fMono, fontSize: 9, color: FAINT, marginTop: 6, letterSpacing: '0.1em' }}>
                Powered by Google Maps · selecciona del dropdown para autocompletar ubigeo
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div style={{ marginBottom: 28 }}>
              <label style={labelSt}>Etiqueta (opcional)</label>
              <input style={inputSt} type="text" name="nombre" value={nueva.nombre}
                onChange={handleChange} placeholder="Casa, Oficina…" onFocus={focus} onBlur={blur} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={labelSt}>Teléfono</label>
              <input style={inputSt} type="text" name="telefono" value={nueva.telefono}
                onChange={handleChange} placeholder="9XXXXXXXX" onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelSt}>Referencia</label>
            <input style={inputSt} type="text" name="referencia" value={nueva.referencia}
              onChange={handleChange} placeholder="Frente al parque, piso 3…" onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px', marginBottom: 32 }}>
            <div>
              <label style={labelSt}>Departamento</label>
              <select style={selectSt} name="department" value={nueva.department}
                onChange={handleChange} onFocus={focus} onBlur={blur}>
                <option value="" style={{ background: PANEL }}>—</option>
                {departments.map(d => <option key={d} value={d} style={{ background: PANEL, color: CREAM }}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Provincia</label>
              <select style={selectSt} name="province" value={nueva.province}
                onChange={handleChange} disabled={!nueva.department} onFocus={focus} onBlur={blur}>
                <option value="" style={{ background: PANEL }}>—</option>
                {provinces.map(p => <option key={p} value={p} style={{ background: PANEL, color: CREAM }}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Distrito</label>
              <select style={selectSt} name="district" value={nueva.district}
                onChange={handleChange} disabled={!nueva.province} onFocus={focus} onBlur={blur}>
                <option value="" style={{ background: PANEL }}>—</option>
                {districts.map(d => <option key={d} value={d} style={{ background: PANEL, color: CREAM }}>{d}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={guardar} disabled={!canSave}
            style={{
              padding: '12px 24px',
              background: canSave ? CREAM : 'var(--hairline-strong)',
              color: canSave ? 'var(--bg-ink)' : FAINT,
              border: 'none', cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: fMono, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (canSave) e.currentTarget.style.background = ACCENT; }}
            onMouseLeave={e => { if (canSave) e.currentTarget.style.background = CREAM; }}
          >
            Guardar dirección
          </button>
        </div>
      )}
    </div>
  );
};

export default DireccionEnvio;
