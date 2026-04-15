/* ============================================
   CONTROL DE ORADORES PRO - APP LOGIC
   ============================================ */

const app = {
    // --- Data Store ---
    db: {
        congregaciones: JSON.parse(localStorage.getItem('congregaciones')) || {},
        bosquejos: JSON.parse(localStorage.getItem('bosquejos')) || {},
        visitantes: JSON.parse(localStorage.getItem('visitantes')) || {},
        salientes: JSON.parse(localStorage.getItem('salientes')) || {},
        arreglos: JSON.parse(localStorage.getItem('arreglos')) || [],
        config: JSON.parse(localStorage.getItem('config')) || {
            nombre: '', nro: '', direccion: '', horario: '', celular: '', responsable: '', email: '', dias: ''
        }
    },
    currentPin: '',
    correctPin: '1234', // Default PIN for demo
    currentOradoresType: 'visitantes',

    // --- Core Methods ---
    init() {
        console.log("Control de Oradores Pro - Initialized");
        this.renderLists();
        this.renderStats();
        this.renderRecentActivity();
        this.setupEventListeners();
        this.updateDataLists();
        this.updateArreglosFlow();
    },

    save() {
        localStorage.setItem('congregaciones', JSON.stringify(this.db.congregaciones));
        localStorage.setItem('bosquejos', JSON.stringify(this.db.bosquejos));
        localStorage.setItem('visitantes', JSON.stringify(this.db.visitantes));
        localStorage.setItem('salientes', JSON.stringify(this.db.salientes));
        localStorage.setItem('arreglos', JSON.stringify(this.db.arreglos));
        localStorage.setItem('config', JSON.stringify(this.db.config));
    },

    navigate(screenId) {
        if (screenId !== 'login' && this.currentPin !== this.correctPin) return;

        // Toggle screens
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById('screen-' + screenId);
        if (target) target.classList.add('active');

        // Toggle nav icons
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const nav = document.getElementById('nav-' + screenId);
        if (nav) nav.classList.add('active');

        // Refresh icons just in case
        lucide.createIcons();

        // Specific screen init
        if (screenId === 'settings') this.loadConfigToUI();
    },

    loadConfigToUI() {
        if (!this.db.config) return;
        document.getElementById('cfg-cong-nombre').value = this.db.config.nombre || '';
        document.getElementById('cfg-cong-nro').value = this.db.config.nro || '';
        document.getElementById('cfg-direccion').value = this.db.config.direccion || '';
        document.getElementById('cfg-dias').value = this.db.config.dias || '';
        document.getElementById('cfg-horario').value = this.db.config.horario || '';
        document.getElementById('cfg-celular').value = this.db.config.celular || '';
        document.getElementById('cfg-responsable').value = this.db.config.responsable || '';
        document.getElementById('cfg-email').value = this.db.config.email || '';
    },

    // --- UI Rendering ---
    renderLists() {
        // Render Congregaciones with search
        const congQuery = document.getElementById('search-cong')?.value?.toLowerCase() || '';
        const congList = document.getElementById('list-congregaciones');
        if (congList) {
            congList.innerHTML = '';
            Object.entries(this.db.congregaciones)
                .filter(([id, name]) => name.toLowerCase().includes(congQuery) || id.includes(congQuery))
                .forEach(([id, name]) => {
                    congList.innerHTML += `
                        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;">
                            <div>
                                <span style="color: var(--primary); font-weight: 700; margin-right: 10px;">${id}</span>
                                <span>${name}</span>
                            </div>
                            <button onclick="app.removeItem('congregaciones', '${id}')" style="background:none; border:none; color: var(--text-muted);">
                                <i data-lucide="trash-2" style="width: 16px;"></i>
                            </button>
                        </div>
                    `;
                });
        }

        // Render Bosquejos with search
        const bosqQuery = document.getElementById('search-bosq')?.value?.toLowerCase() || '';
        const bosqList = document.getElementById('list-bosquejos');
        if (bosqList) {
            bosqList.innerHTML = '';
            Object.entries(this.db.bosquejos)
                .filter(([id, title]) => title.toLowerCase().includes(bosqQuery) || id.includes(bosqQuery))
                .forEach(([id, title]) => {
                    bosqList.innerHTML += `
                        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;">
                            <div style="flex: 1;">
                                <span style="color: var(--secondary); font-weight: 700; margin-right: 10px;">#${id}</span>
                                <span>${title}</span>
                            </div>
                            <button onclick="app.removeItem('bosquejos', '${id}')" style="background:none; border:none; color: var(--text-muted);">
                                <i data-lucide="trash-2" style="width: 16px;"></i>
                            </button>
                        </div>
                    `;
                });
        }

        lucide.createIcons();
        this.updateDataLists();
        this.renderStats();
    },

    setOradoresFilter(tipo) {
        this.currentOradoresType = tipo;
        
        // Update chips UI
        const chips = {
            visitantes: document.getElementById('chip-visitantes'),
            salientes: document.getElementById('chip-salientes')
        };
        
        Object.entries(chips).forEach(([k, el]) => {
            if (el) {
                if (k === tipo) {
                    el.style.background = 'var(--primary)';
                    el.style.color = 'white';
                    el.style.boxShadow = '0 4px 12px var(--primary-glow)';
                } else {
                    el.style.background = 'var(--surface-light)';
                    el.style.color = 'var(--text-muted)';
                    el.style.boxShadow = 'none';
                }
            }
        });

        this.renderOradores();
    },

    renderOradores() {
        const tipo = this.currentOradoresType;
        const list = document.getElementById('items-oradores');
        const query = document.getElementById('search-ora')?.value?.toLowerCase() || '';
        
        if (!list) return;
        list.innerHTML = '';
        
        const data = this.db[tipo] || {};
        Object.entries(data)
            .filter(([nombre, info]) => nombre.toLowerCase().includes(query) || info.nro_cong.toLowerCase().includes(query))
            .forEach(([nombre, info]) => {
                list.innerHTML += `
                    <div class="glass-card fade-in" style="margin-bottom:8px; position:relative;">
                        <div style="font-weight:700;">${nombre}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">
                            Congregación: <span style="color:var(--primary);">${info.nro_cong}</span>
                        </div>
                        <button onclick="app.removeItem('${tipo}', '${nombre}')" style="position:absolute; right:15px; top:15px; background:none; border:none; color:var(--text-dim);">
                            <i data-lucide="x" style="width:14px;"></i>
                        </button>
                    </div>
                `;
            });
        lucide.createIcons();
    },

    renderStats() {
        const statsEl = document.getElementById('stats-speakers');
        if (statsEl) {
            const total = Object.keys(this.db.visitantes).length + Object.keys(this.db.salientes).length;
            statsEl.innerText = total;
        }

        // Update Upcoming Arrangement Card (Mock or First valid)
        const nextArrCard = document.querySelector('.status-card p');
        if (nextArrCard && this.db.arreglos.length > 0) {
            const sorted = [...this.db.arreglos].sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
            const future = sorted.find(a => new Date(a.fecha) >= new Date().setHours(0,0,0,0));
            if (future) {
                const d = new Date(future.fecha);
                const options = { weekday: 'long', day: 'numeric', month: 'long' };
                nextArrCard.innerText = `${d.toLocaleDateString('es-ES', options)} - ${future.tipo}`;
            }
        }
    },

    renderRecentActivity() {
        const recentEl = document.getElementById('recent-activity');
        if (!recentEl) return;

        const recent = [...this.db.arreglos].sort((a,b) => b.id - a.id).slice(0, 3);
        
        if (recent.length === 0) {
            recentEl.innerHTML = '<p style="font-size:0.8rem; color:var(--text-dim); text-align:center; padding:10px;">No hay actividad reciente.</p>';
            return;
        }

        recentEl.innerHTML = recent.map(a => `
            <div class="glass-card fade-in" style="padding: 12px; display: flex; align-items: center; gap: 15px;">
                <div style="width: 40px; height: 40px; border-radius: 10px; background: ${a.tipo === 'Visitante' ? 'var(--secondary-glow)' : 'var(--primary-glow)'}; color: ${a.tipo === 'Visitante' ? 'var(--secondary)' : 'var(--primary)'}; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="${a.tipo === 'Visitante' ? 'user-plus' : 'user-minus'}" style="width: 20px;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 0.9rem; font-weight: 600;">${a.nombre}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${a.congregacion}</div>
                </div>
                <div style="text-align: right; font-size: 0.7rem; color: var(--text-dim);">
                    ${a.fecha.split('-').reverse().join('/')}
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    },

    updateDataLists() {
        const oraDatalist = document.getElementById('data-oradores');
        const bosqDatalist = document.getElementById('data-bosquejos');
        const congArrDatalist = document.getElementById('data-cong-arr');
        
        if (congArrDatalist) {
            congArrDatalist.innerHTML = '';
            Object.entries(this.db.congregaciones).forEach(([id, name]) => {
                congArrDatalist.innerHTML += `<option value="${id} - ${name}">`;
            });
        }

        if (bosqDatalist) {
            bosqDatalist.innerHTML = '';
            Object.entries(this.db.bosquejos).forEach(([id, t]) => {
                bosqDatalist.innerHTML += `<option value="${id} - ${t}">`;
            });
        }
    },

    updateArreglosFlow() {
        const tipo = document.getElementById('arr-tipo');
        const cong = document.getElementById('arr-cong');
        const oraList = document.getElementById('data-oradores');

        if (!tipo || !cong) return;

        // Reset inputs when switching type
        tipo.addEventListener('change', () => {
            cong.value = '';
            if (oraList) oraList.innerHTML = ''; 
        });

        cong.addEventListener('input', () => {
            const congId = cong.value.split(' - ')[0];
            if (congId) this.filterOradoresByCong(congId);
        });
    },

    filterOradoresByCong(congId) {
        const tipo = document.getElementById('arr-tipo').value;
        const oraList = document.getElementById('data-oradores');
        if (!oraList) return;

        oraList.innerHTML = '';
        const sourceKey = tipo === 'Saliente' ? 'salientes' : 'visitantes';
        const oradores = this.db[sourceKey];

        Object.entries(oradores).forEach(([nombre, info]) => {
            if (String(info.nro_cong) === String(congId)) {
                oraList.innerHTML += `<option value="${nombre}">`;
            }
        });
    },

    // --- Action Handlers ---
    setupEventListeners() {
        // Save Congregacion
        const btnSaveCong = document.getElementById('btn-save-cong');
        if (btnSaveCong) {
            btnSaveCong.addEventListener('click', () => {
                const id = document.getElementById('cong-nro').value;
                const nom = document.getElementById('cong-nombre').value;
                if (!id || !nom) return alert("Completa los campos");

                this.db.congregaciones[id] = nom;
                this.save();
                this.renderLists();
                
                document.getElementById('cong-nro').value = '';
                document.getElementById('cong-nombre').value = '';
            });
        }

        // Save Bosquejo
        const btnSaveBosq = document.getElementById('btn-save-bosq');
        if (btnSaveBosq) {
            btnSaveBosq.addEventListener('click', () => {
                const id = document.getElementById('bosq-nro').value;
                const title = document.getElementById('bosq-titulo').value;
                if (!id || !title) return alert("Completa los campos");

                this.db.bosquejos[id] = title;
                this.save();
                this.renderLists();

                document.getElementById('bosq-nro').value = '';
                document.getElementById('bosq-titulo').value = '';
            });
        }

        // Save Orador
        const btnSaveOra = document.getElementById('btn-save-ora');
        if (btnSaveOra) {
            btnSaveOra.addEventListener('click', () => {
                const tipo = document.getElementById('ora-tipo').value;
                const nombre = document.getElementById('ora-nombre').value;
                const nro_cong = document.getElementById('ora-cong-nro').value;
                if (!nombre || !nro_cong) return alert("Completa los campos");

                this.db[tipo][nombre] = { nro_cong };
                this.save();
                this.renderOradores(tipo);
                this.renderStats();
                this.updateDataLists();

                document.getElementById('ora-nombre').value = '';
                document.getElementById('ora-cong-nro').value = '';
            });
        }

        // Save Arreglo
        const btnSaveArr = document.getElementById('btn-save-arr');
        if (btnSaveArr) {
            btnSaveArr.addEventListener('click', () => {
                const fecha = document.getElementById('arr-fecha').value;
                const tipo = document.getElementById('arr-tipo').value;
                const nombre = document.getElementById('arr-nombre').value;
                const bosquejo = document.getElementById('arr-bosquejo').value;
                const congRaw = document.getElementById('arr-cong').value;

                if (!fecha || !nombre || !bosquejo || !congRaw) return alert("Completa todos los campos");

                // --- Auto-Learn Logic ---
                // 1. Process Congregation
                const [congId, ...congParts] = congRaw.split(' - ');
                const congName = congParts.join(' - ').trim();
                if (congId && congName) {
                    if (!this.db.congregaciones[congId]) {
                        this.db.congregaciones[congId] = congName;
                    }
                }

                // 2. Process Speaker
                const targetOraKey = tipo === 'Saliente' ? 'salientes' : 'visitantes';
                if (!this.db[targetOraKey][nombre]) {
                    this.db[targetOraKey][nombre] = { nro_cong: congId };
                }

                // 3. Process Outline
                const [bosqId, ...bosqParts] = bosquejo.split(' - ');
                const bosqTitle = bosqParts.join(' - ').trim();
                if (bosqId && bosqTitle) {
                    if (!this.db.bosquejos[bosqId]) {
                        this.db.bosquejos[bosqId] = bosqTitle;
                    }
                }

                // Save to master lists
                const nuevo = { 
                    fecha, 
                    tipo, 
                    nombre, 
                    bosquejo, 
                    congregacion: congRaw,
                    id: Date.now() 
                };
                
                this.db.arreglos.push(nuevo);
                this.save();
                this.renderLists(); // Refresh all other views
                this.renderRecentActivity();
                alert("Arreglo guardado y base de datos actualizada.");
                
                document.getElementById('arr-nombre').value = '';
                document.getElementById('arr-bosquejo').value = '';
                document.getElementById('arr-cong').value = '';
                this.renderArreglos();
            });
        }

        const filterMonth = document.getElementById('filter-month');
        if (filterMonth) {
            filterMonth.addEventListener('change', () => this.renderArreglos());
        }

        // Excel Imports
        const excelCong = document.getElementById('excel-cong');
        if (excelCong) {
            excelCong.addEventListener('change', (e) => this.importExcel(e, 'congregaciones', ['Nro', 'Nombre']));
        }
        const excelBosq = document.getElementById('excel-bosq');
        if (excelBosq) {
            excelBosq.addEventListener('change', (e) => this.importExcel(e, 'bosquejos', ['Nro', 'Titulo']));
        }

        const excelOra = document.getElementById('excel-ora');
        if (excelOra) {
            excelOra.addEventListener('change', (e) => {
                const tipo = document.getElementById('ora-tipo').value;
                this.importExcel(e, tipo, ['Nombre', 'Congregacion']);
            });
        }

        // Search Handlers
        ['search-cong', 'search-bosq', 'search-ora'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => {
                if (id === 'search-ora') this.renderOradores();
                else this.renderLists();
            });
        });

        const btnSync = document.getElementById('btn-sync-now');
        if (btnSync) {
            btnSync.addEventListener('click', () => {
                alert("Sincronizando con la nube... (Simulado)");
            });
        }

        const btnSaveConfig = document.getElementById('btn-save-config');
        if (btnSaveConfig) {
            btnSaveConfig.addEventListener('click', () => {
                this.db.config = {
                    nombre: document.getElementById('cfg-cong-nombre').value,
                    nro: document.getElementById('cfg-cong-nro').value,
                    direccion: document.getElementById('cfg-direccion').value,
                    dias: document.getElementById('cfg-dias').value,
                    horario: document.getElementById('cfg-horario').value,
                    celular: document.getElementById('cfg-celular').value,
                    responsable: document.getElementById('cfg-responsable').value,
                    email: document.getElementById('cfg-email').value
                };
                this.save();
                alert("Configuración inicial guardada correctamente.");
            });
        }

        const btnExportPdf = document.getElementById('btn-export-pdf');
        if (btnExportPdf) {
            btnExportPdf.addEventListener('click', () => this.exportToPDF());
        }

        const btnShare = document.createElement('button');
        btnShare.className = 'btn-primary';
        btnShare.style = 'padding: 10px; background: #25d366; box-shadow: none; margin-left: 10px;';
        btnShare.id = 'btn-share-wa';
        btnShare.innerHTML = '<i data-lucide="share-2"></i>';
        if (btnExportPdf && !document.getElementById('btn-share-wa')) {
            btnExportPdf.parentNode.appendChild(btnShare);
            btnShare.addEventListener('click', () => this.exportToPDF(true));
            lucide.createIcons();
        }
    },

    importExcel(event, targetKey, columns) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (jsonData.length === 0) {
                    alert("El archivo Excel está vacío.");
                    return;
                }

                // Normalización de llaves (case-insensitive y sin espacios)
                const normalize = (str) => String(str).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const targetCols = columns.map(c => normalize(c));

                let count = 0;
                jsonData.forEach((row, index) => {
                    let entryId = "";
                    let entryValue = "";

                    // Buscar las columnas correctas en la fila
                    Object.keys(row).forEach(key => {
                        const normKey = normalize(key);
                        if (normKey === targetCols[0]) entryId = String(row[key]).trim();
                        if (normKey === targetCols[1]) entryValue = String(row[key]).trim();
                    });

                    if (entryId && entryValue) {
                        this.db[targetKey][entryId] = entryValue;
                        count++;
                    }
                });

                if (count > 0) {
                    this.save();
                    this.renderLists();
                    alert(`✅ ¡Éxito! Se han importado ${count} registros en ${targetKey}.`);
                } else {
                    alert(`⚠️ No se encontraron columnas válidas. Asegúrate de que el Excel tenga las columnas: "${columns.join('" y "')}".`);
                }
            } catch (err) {
                console.error("Error al procesar Excel:", err);
                alert("Error al procesar el archivo. Asegúrate de que sea un Excel válido (.xlsx o .xls).");
            }
            event.target.value = ''; 
        };
        reader.readAsArrayBuffer(file);
    },

    renderArreglos() {
        const filter = document.getElementById('filter-month').value;
        const list = document.getElementById('list-arreglos-results');
        if (!list || !filter) return;

        list.innerHTML = '';
        const filtered = this.db.arreglos.filter(a => a.fecha.startsWith(filter));
        
        if (filtered.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:var(--text-dim); padding:20px;">Sin arreglos para este mes.</p>';
            return;
        }

        filtered.sort((a,b) => new Date(a.fecha) - new Date(b.fecha)).forEach(a => {
            list.innerHTML += `
                <div class="glass-card fade-in" style="border-left: 4px solid ${a.tipo === 'Visitante' ? 'var(--secondary)' : 'var(--primary)'}; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <div style="font-weight:700;">${a.nombre}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${a.bosquejo}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.8rem; font-weight:700;">${a.fecha.split('-').reverse().join('/')}</div>
                            <div style="font-size:0.6rem; text-transform:uppercase; color:${a.tipo === 'Visitante' ? 'var(--secondary)' : 'var(--primary)'}">${a.tipo}</div>
                        </div>
                    </div>
                </div>
            `;
        });
    },

    exportToPDF(share = false) {
        const filter = document.getElementById('filter-month').value;
        if (!filter) return alert("Selecciona primero un mes");

        const filtered = this.db.arreglos.filter(a => a.fecha.startsWith(filter));
        if (filtered.length === 0) return alert("Sin datos para este mes");

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(99, 102, 241);
        doc.text(`PROGRAMA DE DISCURSOS PÚBLICOS`, 105, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(`Mes: ${filter}`, 105, 22, { align: 'center' });

        const salientes = filtered.filter(a => a.tipo === 'Saliente').sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
        const visitantes = filtered.filter(a => a.tipo === 'Visitante').sort((a,b) => new Date(a.fecha) - new Date(b.fecha));

        let currentY = 30;

        // SECCIÓN ANFITRIONA (SALIENTES)
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`CONGREGACIÓN ANFITRIONA: ${this.db.config.nombre || ''} (#${this.db.config.nro || ''})`, 14, currentY);
        
        doc.autoTable({
            startY: currentY + 5,
            head: [['Fecha', 'Orador', 'Congregación Destino', 'Bosquejo']],
            body: salientes.map(a => [a.fecha.split('-').reverse().join('/'), a.nombre, a.congregacion, a.bosquejo]),
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] },
            styles: { fontSize: 9 }
        });

        currentY = doc.lastAutoTable.finalY + 10;
        
        // Host Details Footer (requested)
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Dirección: ${this.db.config.direccion || '---'}`, 14, currentY);
        doc.text(`Días de Reunión: ${this.db.config.dias || '---'} | Horario: ${this.db.config.horario || '---'}`, 14, currentY + 4);
        doc.text(`Responsable: ${this.db.config.responsable || '---'} | Contacto: ${this.db.config.celular || '---'} | Email: ${this.db.config.email || '---'}`, 14, currentY + 8);

        currentY = currentY + 15;

        // SECCIÓN VISITANTES
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("ORADORES VISITANTES (Vienen a nuestra congregación)", 14, currentY);
        
        doc.autoTable({
            startY: currentY + 5,
            head: [['Fecha', 'Orador', 'Congregación Origen', 'Bosquejo']],
            body: visitantes.map(a => [a.fecha.split('-').reverse().join('/'), a.nombre, a.congregacion, a.bosquejo]),
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 9 }
        });

        if (share && navigator.share) {
            const pdfBlob = doc.output('blob');
            const file = new File([pdfBlob], `Arreglo_${filter}.pdf`, { type: 'application/pdf' });
            
            navigator.share({
                files: [file],
                title: 'Arreglo Oradores',
                text: 'Adjunto el programa de discursos públicos.'
            }).catch(err => console.error("Error compartiendo:", err));
        } else if (share) {
            alert("Tu navegador no soporta compartir archivos directamente. Se descargará el PDF.");
            doc.save(`Arreglo_${filter}.pdf`);
        } else {
            doc.save(`Arreglo_${filter}.pdf`);
        }
    },

    removeItem(collection, id) {
        if (confirm('¿Eliminar este registro?')) {
            delete this.db[collection][id];
            this.save();
            this.renderLists();
            if (collection === 'visitantes' || collection === 'salientes') this.renderOradores(collection);
            this.renderStats();
            this.updateDataLists();
        }
    },

    // --- PIN Logic ---
    pressPin(num) {
        if (this.currentPin.length < 4) {
            this.currentPin += num;
            this.updatePinDots();
        }

        if (this.currentPin.length === 4) {
            if (this.currentPin === this.correctPin) {
                setTimeout(() => this.navigate('dashboard'), 200);
            } else {
                alert("PIN Incorrecto");
                this.clearPin();
            }
        }
    },

    clearPin() {
        this.currentPin = '';
        this.updatePinDots();
    },

    updatePinDots() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, i) => {
            if (i < this.currentPin.length) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    },

    // --- Cloud / Manual Tools ---
    exportData() {
        const dataStr = JSON.stringify(this.db, null, 4);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'control_oradores_backup.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file,'UTF-8');
            reader.onload = readerEvent => {
                const content = readerEvent.target.result;
                try {
                    const imported = JSON.parse(content);
                    this.db = imported;
                    this.save();
                    alert("Datos importados con éxito");
                    location.reload();
                } catch(e) { alert("Archivo inválido"); }
            }
        }
        input.click();
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
