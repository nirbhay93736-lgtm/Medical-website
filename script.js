/* =========================================================
   MEDICARE PHARMACY - FRONTEND FUNCTIONALITY
   HTML + CSS + JavaScript only
   Data is stored in browser localStorage.
   ========================================================= */

(() => {
    "use strict";

    const KEY = "medicare_pharmacy_data_v1";

    const seed = {
        medicines: [
            {id:"M001", name:"Paracetamol 500mg", type:"Tablet", company:"Sun Pharma", price:25, qty:120, expiry:"Dec 2027"},
            {id:"M002", name:"Azithromycin 250mg", type:"Tablet", company:"Cipla", price:85, qty:5, expiry:"Aug 2027"},
            {id:"M003", name:"Amoxicillin 500mg", type:"Capsule", company:"Abbott", price:120, qty:9, expiry:"Nov 2027"},
            {id:"M004", name:"Cetirizine 10mg", type:"Tablet", company:"Dr. Reddy's", price:45, qty:75, expiry:"Oct 2026"},
            {id:"M005", name:"Vitamin D3", type:"Capsule", company:"Himalaya", price:110, qty:42, expiry:"Sep 2026"}
        ],
        customers: [
            {id:"C001", name:"Rahul Sharma", email:"rahul@example.com", phone:"98765 43210", address:"Nagpur, Maharashtra", purchases:8450, last:"18 Aug 2026", active:true},
            {id:"C002", name:"Priya Patil", email:"priya@example.com", phone:"91234 56780", address:"Wardha, Maharashtra", purchases:6720, last:"17 Aug 2026", active:true},
            {id:"C003", name:"Amit Verma", email:"amit@example.com", phone:"99887 66554", address:"Amravati, Maharashtra", purchases:4280, last:"16 Aug 2026", active:true},
            {id:"C004", name:"Neha Singh", email:"neha@example.com", phone:"90909 80808", address:"Chandrapur, Maharashtra", purchases:3150, last:"10 Aug 2026", active:false},
            {id:"C005", name:"Sunil Kumar", email:"sunil@example.com", phone:"93456 78901", address:"Nagpur, Maharashtra", purchases:5680, last:"15 Aug 2026", active:true}
        ],
        suppliers: [
            {id:"S001", name:"Sun Pharma", type:"Pharmaceutical Company", phone:"1800 123 4567", medicines:42, purchases:78450, last:"18 Aug 2026", active:true},
            {id:"S002", name:"Cipla Ltd.", type:"Pharmaceutical Company", phone:"1800 267 7777", medicines:36, purchases:64280, last:"16 Aug 2026", active:true},
            {id:"S003", name:"Abbott India", type:"Healthcare Company", phone:"1800 103 1460", medicines:31, purchases:52680, last:"14 Aug 2026", active:true},
            {id:"S004", name:"Dr. Reddy's", type:"Pharmaceutical Company", phone:"040 4900 2900", medicines:28, purchases:38450, last:"11 Aug 2026", active:true},
            {id:"S005", name:"Himalaya", type:"Healthcare Products", phone:"1800 208 1930", medicines:24, purchases:24760, last:"09 Aug 2026", active:false}
        ],
        sales: [],
        nextInvoice: 86
    };

    function loadData() {
        try {
            const saved = localStorage.getItem(KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Could not read saved data", e);
        }
        localStorage.setItem(KEY, JSON.stringify(seed));
        return JSON.parse(JSON.stringify(seed));
    }

    let data = loadData();

    function save() {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    function money(n) {
        return "₹" + Number(n || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    function toast(message, type = "success") {
        let box = document.getElementById("medicare-toast");
        if (!box) {
            box = document.createElement("div");
            box.id = "medicare-toast";
            box.style.cssText = `
                position:fixed;right:24px;bottom:24px;z-index:99999;
                padding:13px 18px;border-radius:9px;background:#0b9b8c;color:#fff;
                font:600 13px Arial,sans-serif;box-shadow:0 8px 25px rgba(0,0,0,.18);
                transition:opacity .25s,transform .25s;
            `;
            document.body.appendChild(box);
        }
        box.textContent = message;
        box.style.background = type === "error" ? "#d9534f" : "#0b9b8c";
        box.style.opacity = "1";
        box.style.transform = "translateY(0)";
        clearTimeout(box._timer);
        box._timer = setTimeout(() => {
            box.style.opacity = "0";
            box.style.transform = "translateY(8px)";
        }, 2200);
    }

    function modal(title, fields, onSave, submitText="Save") {
        const old = document.getElementById("medicare-modal");
        if (old) old.remove();

        const overlay = document.createElement("div");
        overlay.id = "medicare-modal";
        overlay.style.cssText = `
            position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99998;
            display:flex;align-items:center;justify-content:center;padding:20px;
        `;

        const card = document.createElement("div");
        card.style.cssText = `
            width:min(520px,100%);max-height:90vh;overflow:auto;background:#fff;
            border-radius:14px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.25);
            font-family:Arial,sans-serif;
        `;

        const heading = document.createElement("div");
        heading.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;";
        heading.innerHTML = `<h2 style="margin:0;color:#405b6e;font-size:19px;">${title}</h2>
            <button type="button" data-close style="border:0;background:#f1f5f7;width:32px;height:32px;border-radius:7px;cursor:pointer;font-size:18px;">×</button>`;
        card.appendChild(heading);

        const form = document.createElement("form");
        form.style.cssText = "display:grid;gap:12px;";

        fields.forEach(f => {
            const wrap = document.createElement("div");
            const label = document.createElement("label");
            label.textContent = f.label;
            label.style.cssText = "display:block;font-size:12px;font-weight:700;color:#617887;margin-bottom:5px;";
            wrap.appendChild(label);

            let input;
            if (f.type === "select") {
                input = document.createElement("select");
                (f.options || []).forEach(o => {
                    const opt = document.createElement("option");
                    opt.value = o.value ?? o;
                    opt.textContent = o.label ?? o;
                    input.appendChild(opt);
                });
            } else if (f.type === "textarea") {
                input = document.createElement("textarea");
                input.rows = 3;
            } else {
                input = document.createElement("input");
                input.type = f.type || "text";
            }

            input.name = f.name;
            input.value = f.value ?? "";
            input.required = !!f.required;
            input.placeholder = f.placeholder || "";
            input.style.cssText = `
                width:100%;box-sizing:border-box;height:${f.type==="textarea"?"auto":"38px"};
                padding:9px 10px;border:1px solid #dfe8ed;border-radius:7px;outline:none;
                font:13px Arial,sans-serif;color:#405b6e;
            `;
            wrap.appendChild(input);
            form.appendChild(wrap);
        });

        const actions = document.createElement("div");
        actions.style.cssText = "display:flex;justify-content:flex-end;gap:9px;margin-top:6px;";
        actions.innerHTML = `
            <button type="button" data-close style="padding:9px 15px;border:1px solid #dfe8ed;background:#fff;border-radius:7px;cursor:pointer;">Cancel</button>
            <button type="submit" style="padding:9px 16px;border:0;background:#0b9b8c;color:#fff;border-radius:7px;cursor:pointer;font-weight:700;">${submitText}</button>
        `;
        form.appendChild(actions);
        card.appendChild(form);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        overlay.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => overlay.remove()));
        overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

        form.addEventListener("submit", e => {
            e.preventDefault();
            const values = Object.fromEntries(new FormData(form).entries());
            onSave(values);
            overlay.remove();
        });

        const first = form.querySelector("input,select,textarea");
        if (first) setTimeout(() => first.focus(), 50);
    }

    function nextId(prefix, list) {
        let max = 0;
        list.forEach(x => {
            const m = String(x.id || "").match(/(\d+)$/);
            if (m) max = Math.max(max, Number(m[1]));
        });
        return prefix + String(max + 1).padStart(3, "0");
    }

    function initials(name) {
        return String(name).trim().split(/\s+/).slice(0,2).map(x => x[0]).join("").toUpperCase();
    }

    function escapeHtml(s) {
        return String(s ?? "").replace(/[&<>"']/g, c => ({
            "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
        }[c]));
    }

    function medicineStatus(qty) {
        qty = Number(qty);
        if (qty <= 0) return ["Out of Stock", "out-stock"];
        if (qty <= 10) return ["Low Stock", "low-stock"];
        return ["Available", "available"];
    }

    function renderMedicines(filter="") {
        const table = document.querySelector(".medicine-table tbody");
        if (!table) return;
        const q = filter.toLowerCase();
        const list = data.medicines.filter(m =>
            m.name.toLowerCase().includes(q) || m.company.toLowerCase().includes(q)
        );

        table.innerHTML = list.map(m => {
            const [status, cls] = medicineStatus(m.qty);
            return `<tr>
                <td>#${escapeHtml(m.id.replace("M",""))}</td>
                <td><div class="medicine-name">
                    <div class="medicine-img"><i class="fa-solid fa-pills"></i></div>
                    <div><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.type)}</small></div>
                </div></td>
                <td>${escapeHtml(m.company)}</td>
                <td>${money(m.price)}</td>
                <td>${m.qty}</td>
                <td>${escapeHtml(m.expiry)}</td>
                <td><span class="status ${cls}">${status}</span></td>
                <td><div class="table-actions">
                    <button class="edit-btn" data-id="${m.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn" data-id="${m.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div></td>
            </tr>`;
        }).join("");

        const total = document.querySelectorAll(".mini-stat strong");
        if (total.length) {
            const low = data.medicines.filter(m => m.qty > 0 && m.qty <= 10).length;
            const out = data.medicines.filter(m => m.qty <= 0).length;
            total[0].textContent = data.medicines.length;
            if (total[1]) total[1].textContent = data.medicines.filter(m=>m.qty>0).length;
            if (total[2]) total[2].textContent = low;
            if (total[3]) total[3].textContent = out;
        }
    }

    function medicineForm(existing) {
        modal(existing ? "Edit Medicine" : "Add Medicine", [
            {name:"name",label:"Medicine Name",required:true,value:existing?.name,placeholder:"e.g. Paracetamol 500mg"},
            {name:"type",label:"Type",required:true,value:existing?.type || "Tablet",placeholder:"Tablet / Capsule / Syrup"},
            {name:"company",label:"Company",required:true,value:existing?.company,placeholder:"Company name"},
            {name:"price",label:"Price (₹)",type:"number",required:true,value:existing?.price || "",placeholder:"0"},
            {name:"qty",label:"Quantity",type:"number",required:true,value:existing?.qty ?? 0,placeholder:"0"},
            {name:"expiry",label:"Expiry",required:true,value:existing?.expiry,placeholder:"e.g. Dec 2027"}
        ], v => {
            if (existing) {
                Object.assign(existing, {name:v.name,type:v.type,company:v.company,price:Number(v.price),qty:Number(v.qty),expiry:v.expiry});
                toast("Medicine updated successfully");
            } else {
                data.medicines.push({
                    id:nextId("M",data.medicines), name:v.name,type:v.type,company:v.company,
                    price:Number(v.price),qty:Number(v.qty),expiry:v.expiry
                });
                toast("Medicine added successfully");
            }
            save();
            renderMedicines(document.querySelector(".medicine-search input")?.value || "");
            syncBillingMedicineOptions();
        });
    }

    function setupMedicines() {
        const add = document.querySelector(".add-medicine-btn");
        if (add) add.addEventListener("click", () => medicineForm());

        const search = document.querySelector(".medicine-search input");
        if (search) search.addEventListener("input", e => renderMedicines(e.target.value));

        renderMedicines(search?.value || "");

        document.addEventListener("click", e => {
            const del = e.target.closest(".medicine-table .delete-btn");
            const edit = e.target.closest(".medicine-table .edit-btn");
            if (del) {
                const id = del.dataset.id;
                const m = data.medicines.find(x=>x.id===id);
                if (m && confirm(`Delete ${m.name}?`)) {
                    data.medicines = data.medicines.filter(x=>x.id!==id);
                    save();
                    renderMedicines(search?.value || "");
                    syncBillingMedicineOptions();
                    toast("Medicine deleted");
                }
            }
            if (edit) {
                const m = data.medicines.find(x=>x.id===edit.dataset.id);
                if (m) medicineForm(m);
            }
        }, {once:false});
    }

    function parseExpiry(expiry) {
        const m = String(expiry || "").trim().match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
        if (!m) return null;
        const monthNames = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
        const month = monthNames.indexOf(m[1].slice(0,3).toLowerCase());
        if (month < 0) return null;
        // Expiry means the medicine is usable through the end of that month.
        return new Date(Number(m[2]), month + 1, 0, 23, 59, 59);
    }

    function isExpired(m) {
        const d = parseExpiry(m.expiry);
        return !!d && d < new Date();
    }

    function stockStatus(m) {
        if (isExpired(m)) return ["Expired", "expired"];
        return medicineStatus(m.qty);
    }

    function renderStockAlerts() {
        const lowCard = document.querySelector(".stock-alert-card");
        const expiredCard = document.querySelector(".expired-stock-card");

        if (lowCard) {
            const count = lowCard.querySelector(".alert-count");
            const items = data.medicines.filter(m => Number(m.qty) > 0 && Number(m.qty) <= 10);

            if (count) count.textContent = `${items.length} Item${items.length === 1 ? "" : "s"}`;

            lowCard.querySelectorAll(".stock-alert-item").forEach(el => el.remove());

            const header = lowCard.querySelector(".card-header");
            if (header) {
                if (items.length) {
                    items.forEach(m => {
                        const row = document.createElement("div");
                        row.className = "stock-alert-item";
                        row.innerHTML = `
                            <div class="stock-product-icon">
                                <i class="fa-solid fa-pills"></i>
                            </div>
                            <div class="stock-product-info">
                                <strong>${escapeHtml(m.name)}</strong>
                                <small>${escapeHtml(m.company)}</small>
                            </div>
                            <div class="stock-number">
                                <strong>${Number(m.qty)}</strong>
                                <small>units left</small>
                            </div>
                            <button class="restock-btn" data-id="${escapeHtml(m.id)}">
                                Restock
                            </button>
                        `;
                        header.insertAdjacentElement("afterend", row);
                    });
                } else {
                    const empty = document.createElement("div");
                    empty.className = "stock-alert-item";
                    empty.innerHTML = `
                        <div class="stock-product-icon">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="stock-product-info">
                            <strong>All medicines have good stock</strong>
                            <small>No restocking required</small>
                        </div>
                    `;
                    header.insertAdjacentElement("afterend", empty);
                }
            }
        }

        if (expiredCard) {
            const count = expiredCard.querySelector(".expired-count");
            const items = data.medicines.filter(isExpired);

            if (count) count.textContent = `${items.length} Item${items.length === 1 ? "" : "s"}`;

            expiredCard.querySelectorAll(".expired-item").forEach(el => el.remove());

            const header = expiredCard.querySelector(".card-header");
            if (header) {
                items.forEach(m => {
                    const row = document.createElement("div");
                    row.className = "expired-item";
                    row.innerHTML = `
                        <div>
                            <strong>${escapeHtml(m.name)}</strong>
                            <small>${escapeHtml(m.company)}</small>
                        </div>
                        <span>${escapeHtml(m.expiry)}</span>
                    `;
                    header.insertAdjacentElement("afterend", row);
                });

                const oldView = expiredCard.querySelector(".view-expired-btn");
                if (oldView) {
                    oldView.onclick = () => {
                        const select = document.querySelector(".inventory-tools select");
                        if (select) {
                            select.value = "Expired";
                            renderStock(document.querySelector("input[placeholder='Search stock...']")?.value || "", "Expired");
                        }
                        document.querySelector(".inventory-table")?.scrollIntoView({behavior:"smooth", block:"start"});
                    };
                }
            }
        }
    }

    function renderStock(filter="", statusFilter="All Status") {
        const table = document.querySelector(".inventory-table tbody");
        if (!table) return;

        const q = String(filter || "").toLowerCase().trim();
        const status = statusFilter || "All Status";

        const list = data.medicines.filter(m => {
            const matchesSearch =
                m.name.toLowerCase().includes(q) ||
                m.company.toLowerCase().includes(q);

            const [st] = stockStatus(m);

            let matchesStatus = true;
            if (status === "Good Stock") matchesStatus = !isExpired(m) && Number(m.qty) > 10;
            if (status === "Low Stock") matchesStatus = !isExpired(m) && Number(m.qty) > 0 && Number(m.qty) <= 10;
            if (status === "Expired") matchesStatus = isExpired(m);

            return matchesSearch && matchesStatus;
        });

        table.innerHTML = list.length ? list.map(m => {
            const sold = Number(m.sold || 0);
            const total = Number(m.qty || 0) + sold;
            const [statusText, cls] = stockStatus(m);

            return `<tr>
                <td>
                    <div class="medicine-name">
                        <div class="medicine-img"><i class="fa-solid fa-pills"></i></div>
                        <div>
                            <strong>${escapeHtml(m.name)}</strong>
                            <small>${escapeHtml(m.type)}</small>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(m.company)}</td>
                <td>${total}</td>
                <td>${sold}</td>
                <td><strong>${Number(m.qty || 0)}</strong></td>
                <td>${escapeHtml(m.expiry)}</td>
                <td><span class="status ${cls}">${statusText}</span></td>
                <td>
                    <button class="update-stock-btn" data-id="${escapeHtml(m.id)}" title="Restock">
                        <i class="fa-solid fa-arrows-rotate"></i>
                    </button>
                </td>
            </tr>`;
        }).join("") : `<tr><td colspan="8" style="text-align:center;padding:30px;color:#8a9aa5;">No medicines found.</td></tr>`;

        const stats = document.querySelectorAll(".stock-stat strong");
        if (stats.length) {
            const total = data.medicines.reduce((sum, m) => sum + Number(m.qty || 0), 0);
            const good = data.medicines
                .filter(m => !isExpired(m) && Number(m.qty) > 10)
                .reduce((sum, m) => sum + Number(m.qty || 0), 0);
            const low = data.medicines.filter(m => !isExpired(m) && Number(m.qty) > 0 && Number(m.qty) <= 10).length;
            const expired = data.medicines.filter(isExpired).length;

            stats[0].textContent = total.toLocaleString("en-IN");
            if (stats[1]) stats[1].textContent = good.toLocaleString("en-IN");
            if (stats[2]) stats[2].textContent = low;
            if (stats[3]) stats[3].textContent = expired;
        }

        renderStockAlerts();
    }

    function restockMedicine(id) {
        const m = data.medicines.find(x => x.id === id);
        if (!m) return;

        modal("Restock Medicine", [
            {name:"medicine", label:"Medicine", value:m.name},
            {name:"qty", label:"Quantity to Add", type:"number", required:true, value:10, placeholder:"Enter quantity"}
        ], v => {
            const add = Math.max(1, Number(v.qty) || 0);
            m.qty = Number(m.qty || 0) + add;
            save();

            const search = document.querySelector("input[placeholder='Search stock...']")?.value || "";
            const select = document.querySelector(".inventory-tools select")?.value || "All Status";

            renderStock(search, select);
            renderMedicines(document.querySelector(".medicine-search input")?.value || "");
            toast(`${add} units added to ${m.name}`);
        }, "Add Stock");
    }

    function setupStock() {
        const search = document.querySelector("input[placeholder='Search stock...']");
        const statusSelect = document.querySelector(".inventory-tools select");

        if (search) {
            search.addEventListener("input", e => {
                renderStock(e.target.value, statusSelect?.value || "All Status");
            });
        }

        if (statusSelect) {
            statusSelect.addEventListener("change", e => {
                renderStock(search?.value || "", e.target.value);
            });
        }

        document.addEventListener("click", e => {
            const btn = e.target.closest(".update-stock-btn, .restock-btn");
            if (!btn) return;

            const id = btn.dataset.id;
            if (id) restockMedicine(id);
        });

        renderStock(search?.value || "", statusSelect?.value || "All Status");
    }

    function renderCustomers(filter="") {
        const table=document.querySelector(".customer-table tbody");
        if(!table) return;
        const q=filter.toLowerCase();
        const list=data.customers.filter(c=>`${c.name} ${c.phone}`.toLowerCase().includes(q));
        table.innerHTML=list.map(c=>`<tr>
            <td>#${escapeHtml(c.id.replace("C",""))}</td>
            <td><div class="customer-name"><div class="customer-avatar">${escapeHtml(initials(c.name))}</div>
                <div><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.email)}</small></div></div></td>
            <td>${escapeHtml(c.phone)}</td><td>${escapeHtml(c.address)}</td><td>${money(c.purchases)}</td>
            <td>${escapeHtml(c.last)}</td><td><span class="customer-status ${c.active?"active":"inactive"}">${c.active?"Active":"Inactive"}</span></td>
            <td><div class="table-actions">
                <button class="view-btn" data-id="${c.id}" title="View"><i class="fa-solid fa-eye"></i></button>
                <button class="edit-btn" data-id="${c.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" data-id="${c.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div></td>
        </tr>`).join("");
    }

    function customerForm(existing){
        modal(existing?"Edit Customer":"Add Customer",[
            {name:"name",label:"Customer Name",required:true,value:existing?.name},
            {name:"email",label:"Email",type:"email",value:existing?.email},
            {name:"phone",label:"Phone Number",required:true,value:existing?.phone},
            {name:"address",label:"Address",required:true,value:existing?.address}
        ],v=>{
            if(existing){
                Object.assign(existing,{name:v.name,email:v.email,phone:v.phone,address:v.address});
                toast("Customer updated");
            }else{
                data.customers.push({id:nextId("C",data.customers),name:v.name,email:v.email,phone:v.phone,address:v.address,purchases:0,last:"—",active:true});
                toast("Customer added");
            }
            save();
            renderCustomers(document.querySelector(".customer-search input")?.value||"");
            syncBillingCustomerOptions();
        });
    }

    function setupCustomers(){
        const add=document.querySelector(".add-customer-btn");
        if(add) add.addEventListener("click",()=>customerForm());
        const search=document.querySelector(".customer-search input, input[placeholder='Search customer by name or phone...']");
        if(search) search.addEventListener("input",e=>renderCustomers(e.target.value));
        renderCustomers(search?.value||"");

        document.addEventListener("click",e=>{
            const edit=e.target.closest(".customer-table .edit-btn");
            const del=e.target.closest(".customer-table .delete-btn");
            const view=e.target.closest(".customer-table .view-btn");
            if(edit){
                const c=data.customers.find(x=>x.id===edit.dataset.id);
                if(c) customerForm(c);
            }
            if(del){
                const c=data.customers.find(x=>x.id===del.dataset.id);
                if(c&&confirm(`Delete ${c.name}?`)){
                    data.customers=data.customers.filter(x=>x.id!==c.id);save();
                    renderCustomers(search?.value||"");syncBillingCustomerOptions();toast("Customer deleted");
                }
            }
            if(view){
                const c=data.customers.find(x=>x.id===view.dataset.id);
                if(c) toast(`${c.name} • ${c.phone} • Purchases ${money(c.purchases)}`);
            }
        });
    }

    function renderSuppliers(filter=""){
        const table=document.querySelector(".supplier-table tbody");
        if(!table)return;
        const q=filter.toLowerCase();
        const list=data.suppliers.filter(s=>`${s.name} ${s.phone}`.toLowerCase().includes(q));
        table.innerHTML=list.map(s=>`<tr>
            <td>#${escapeHtml(s.id.replace("S",""))}</td>
            <td><div class="supplier-name"><div class="supplier-avatar">${escapeHtml(initials(s.name))}</div>
                <div><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.type)}</small></div></div></td>
            <td>${escapeHtml(s.phone)}</td><td><strong>${s.medicines}</strong> medicines</td><td>${money(s.purchases)}</td>
            <td>${escapeHtml(s.last)}</td><td><span class="supplier-status ${s.active?"active":"inactive"}">${s.active?"Active":"Inactive"}</span></td>
            <td><div class="table-actions">
                <button class="view-btn" data-id="${s.id}" title="View"><i class="fa-solid fa-eye"></i></button>
                <button class="edit-btn" data-id="${s.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" data-id="${s.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div></td>
        </tr>`).join("");
    }

    function supplierForm(existing){
        modal(existing?"Edit Supplier":"Add Supplier",[
            {name:"name",label:"Supplier Name",required:true,value:existing?.name},
            {name:"type",label:"Company Type",required:true,value:existing?.type||"Pharmaceutical Company"},
            {name:"phone",label:"Contact Number",required:true,value:existing?.phone},
            {name:"medicines",label:"Medicines Supplied",type:"number",value:existing?.medicines||0},
            {name:"purchases",label:"Purchase Amount (₹)",type:"number",value:existing?.purchases||0}
        ],v=>{
            if(existing){
                Object.assign(existing,{name:v.name,type:v.type,phone:v.phone,medicines:Number(v.medicines),purchases:Number(v.purchases)});
                toast("Supplier updated");
            }else{
                data.suppliers.push({id:nextId("S",data.suppliers),name:v.name,type:v.type,phone:v.phone,medicines:Number(v.medicines),purchases:Number(v.purchases),last:"—",active:true});
                toast("Supplier added");
            }
            save();renderSuppliers(document.querySelector("input[placeholder='Search supplier by name or contact...']")?.value||"");
        });
    }

    function setupSuppliers(){
        const add=document.querySelector(".add-supplier-btn");
        if(add)add.addEventListener("click",()=>supplierForm());
        const search=document.querySelector("input[placeholder='Search supplier by name or contact...']");
        if(search)search.addEventListener("input",e=>renderSuppliers(e.target.value));
        renderSuppliers(search?.value||"");

        document.addEventListener("click",e=>{
            const edit=e.target.closest(".supplier-table .edit-btn");
            const del=e.target.closest(".supplier-table .delete-btn");
            const view=e.target.closest(".supplier-table .view-btn");
            if(edit){const s=data.suppliers.find(x=>x.id===edit.dataset.id);if(s)supplierForm(s);}
            if(del){const s=data.suppliers.find(x=>x.id===del.dataset.id);if(s&&confirm(`Delete ${s.name}?`)){data.suppliers=data.suppliers.filter(x=>x.id!==s.id);save();renderSuppliers(search?.value||"");toast("Supplier deleted");}}
            if(view){const s=data.suppliers.find(x=>x.id===view.dataset.id);if(s)toast(`${s.name} • ${s.phone}`);}
        });
    }

    function syncBillingMedicineOptions(){
        const selects=document.querySelectorAll(".medicine-select-field select");
        selects.forEach(sel=>{
            const current=sel.value;
            sel.innerHTML='<option value="">Select Medicine</option>'+data.medicines.map(m=>`<option value="${m.id}">${escapeHtml(m.name)}</option>`).join("");
            if([...sel.options].some(o=>o.value===current))sel.value=current;
        });
    }

    function syncBillingCustomerOptions(){
        const selects=document.querySelectorAll(".billing-field select");
        selects.forEach(sel=>{
            if(!sel.closest(".billing-form-grid"))return;
            const current=sel.value;
            sel.innerHTML='<option value="">Select Customer</option>'+data.customers.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
            if([...sel.options].some(o=>o.value===current))sel.value=current;
        });
    }

    function billingStateFromDOM(){
        const items=[...document.querySelectorAll(".bill-item")].map(row=>{
            const name=row.querySelector(".bill-medicine strong")?.textContent?.trim();
            const price=parseFloat((row.children[1]?.textContent||"0").replace(/[₹,]/g,""))||0;
            const qty=parseInt(row.querySelector(".qty-box")?.textContent||"1",10)||1;
            return {name,price,qty};
        });
        return items;
    }

    function updateBillTotals(){
        const items=billingStateFromDOM();
        const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0);
        const discount=subtotal>0?10:0;
        const taxable=Math.max(0,subtotal-discount);
        const tax=taxable*0.05;
        const total=taxable+tax;

        const rows=document.querySelectorAll(".summary-row strong");
        if(rows[0])rows[0].textContent=money(subtotal);
        if(rows[1])rows[1].textContent="- "+money(discount);
        if(rows[2])rows[2].textContent=money(tax);

        const grand=document.querySelector(".grand-total strong");
        if(grand)grand.textContent=money(total);

        const paidInput=document.querySelector(".amount-paid input");
        const paid=parseFloat((paidInput?.value||"").replace(/[₹,]/g,""))||0;
        const change=document.querySelector(".change-row strong");
        if(change)change.textContent=money(Math.max(0,paid-total));

        return {items,subtotal,discount,tax,total,paid};
    }

    function addBillingItem(){
        const select=document.querySelector(".medicine-select-field select");
        const qtyInput=document.querySelector(".quantity-field input");
        if(!select||!qtyInput)return;
        const id=select.value;
        const qty=Math.max(1,parseInt(qtyInput.value,10)||1);
        const m=data.medicines.find(x=>x.id===id);
        if(!m){toast("Please select a medicine","error");return;}
        if(qty>m.qty){toast(`Only ${m.qty} units available`,"error");return;}

        const container=document.querySelector(".bill-items");
        if(!container)return;
        const existing=[...container.querySelectorAll(".bill-item")].find(r=>r.dataset.id===id);
        if(existing){
            const q=existing.querySelector(".qty-box");
            const newQ=Math.min(m.qty,(parseInt(q.textContent,10)||0)+qty);
            q.textContent=newQ;
            existing.children[3].textContent=money(m.price*newQ);
        }else{
            const row=document.createElement("div");
            row.className="bill-item";
            row.dataset.id=id;
            row.innerHTML=`<div class="bill-medicine"><div class="bill-medicine-icon"><i class="fa-solid fa-pills"></i></div>
                <div><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.company)}</small></div></div>
                <span>${money(m.price)}</span><span class="qty-box">${qty}</span><strong>${money(m.price*qty)}</strong>
                <button class="remove-item"><i class="fa-solid fa-trash"></i></button>`;
            container.appendChild(row);
        }
        updateBillTotals();
        toast("Medicine added to bill");
    }

    function clearBill(){
        const container=document.querySelector(".bill-items");
        if(container)container.innerHTML="";
        updateBillTotals();
        const paid=document.querySelector(".amount-paid input");
        if(paid)paid.value="₹0";
        toast("Bill cleared");
    }

    function generateBill(){
        const result=updateBillTotals();
        if(!result.items.length){toast("Add at least one medicine","error");return;}
        if(result.paid<result.total){toast("Amount paid is less than total","error");return;}

        result.items.forEach(item=>{
            const m=data.medicines.find(x=>x.name===item.name);
            if(m){m.qty=Math.max(0,m.qty-item.qty);m.sold=(m.sold||0)+item.qty;}
        });

        const invoice="INV-2026-"+String(data.nextInvoice++).padStart(4,"0");
        const customerSelect=document.querySelector(".billing-form-grid select");
        const customerId=customerSelect?.value;
        const c=data.customers.find(x=>x.id===customerId);
        if(c){c.purchases=(c.purchases||0)+result.total;c.last=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});}

        data.sales.push({invoice,date:new Date().toISOString(),customer:c?.name||"Walk-in Customer",total:result.total,items:result.items});
        save();

        const inv=document.querySelector(".invoice-heading p");
        if(inv)inv.textContent="Invoice #"+invoice;

        toast("Bill generated successfully");
        printInvoice(invoice,result);
        setTimeout(clearBill,400);
    }

    function printInvoice(invoice,result){
        const win=window.open("","_blank","width=700,height=800");
        if(!win){toast("Allow pop-ups to print invoice","error");return;}
        const rows=result.items.map(i=>`<tr><td>${escapeHtml(i.name)}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(i.price*i.qty)}</td></tr>`).join("");
        win.document.write(`<!doctype html><html><head><title>${invoice}</title><style>
            body{font-family:Arial;padding:30px;color:#333}h1{color:#0b9b8c}table{width:100%;border-collapse:collapse;margin-top:20px}
            th,td{border-bottom:1px solid #ddd;padding:9px;text-align:left}.total{text-align:right;margin-top:20px;font-size:18px;font-weight:bold}
        </style></head><body><h1>Medicare Pharmacy</h1><p>Nagpur, Maharashtra</p><h2>Invoice ${invoice}</h2>
        <table><thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="total">Total: ${money(result.total)}</div><p>Thank you for visiting Medicare Pharmacy.</p></body></html>`);
        win.document.close();win.focus();setTimeout(()=>win.print(),250);
    }

    function setupBilling(){
        syncBillingMedicineOptions();
        syncBillingCustomerOptions();

        const add=document.querySelector(".add-item-btn");
        if(add)add.addEventListener("click",addBillingItem);

        const paid=document.querySelector(".amount-paid input");
        if(paid){paid.addEventListener("input",updateBillTotals);paid.addEventListener("focus",()=>paid.select());}

        document.addEventListener("click",e=>{
            const remove=e.target.closest(".remove-item");
            if(remove){remove.closest(".bill-item")?.remove();updateBillTotals();toast("Item removed");}
        });

        const gen=document.querySelector(".generate-bill-btn");
        if(gen)gen.addEventListener("click",generateBill);

        const clear=document.querySelector(".clear-bill-btn");
        if(clear)clear.addEventListener("click",clearBill);

        const newCustomer=document.querySelector(".new-customer-btn");
        if(newCustomer)newCustomer.addEventListener("click",()=>customerForm());

        updateBillTotals();
    }

    function setupLogin(){
        const form=document.querySelector(".login-page form, form[action='dashboard.html']");
        if(!form)return;
        form.addEventListener("submit",e=>{
            e.preventDefault();
            const inputs=form.querySelectorAll("input");
            const username=inputs[0]?.value.trim();
            const password=inputs[1]?.value.trim();
            if(!username||!password){toast("Enter username and password","error");return;}
            localStorage.setItem("medicare_logged_in","1");
            localStorage.setItem("medicare_user",username);
            window.location.href="dashboard.html";
        });
    }

    function setupIndex(){
        const input=document.querySelector("input[placeholder='Search medicines...']");
        const button=[...document.querySelectorAll("button")].find(b=>b.textContent.trim().toLowerCase().includes("search"));
        if(button)button.addEventListener("click",()=>medicineSearchHome(input?.value||""));
        if(input)input.addEventListener("keydown",e=>{if(e.key==="Enter")medicineSearchHome(input.value);});
    }

    function medicineSearchHome(q){
        const value=q.trim();
        if(!value){toast("Enter a medicine name","error");return;}
        const found=data.medicines.filter(m=>`${m.name} ${m.company}`.toLowerCase().includes(value.toLowerCase()));
        if(found.length)toast(`${found.length} medicine(s) found: ${found.slice(0,2).map(m=>m.name).join(", ")}`);
        else toast("Medicine not found","error");
    }

    function setupAbout(){
        const form=document.querySelector(".contact-form");
        if(form){
            const btn=form.querySelector(".send-message-btn");
            if(btn)btn.addEventListener("click",e=>{
                e.preventDefault();
                const inputs=form.querySelectorAll("input");
                const message=form.querySelector("textarea")?.value.trim();
                if(!inputs[0]?.value.trim()||!inputs[2]?.value.trim()||!message){toast("Please fill name, email and message","error");return;}
                toast("Message sent successfully");
                inputs.forEach(i=>i.value="");
                if(form.querySelector("textarea"))form.querySelector("textarea").value="";
            });
        }
        const dir=document.querySelector(".directions-btn");
        if(dir)dir.addEventListener("click",()=>window.open("https://www.google.com/maps/search/?api=1&query=Nagpur+Maharashtra","_blank"));
    }

    function setupReports(){
        const gen=document.querySelector(".generate-report-btn");
        if(gen)gen.addEventListener("click",()=>{
            const from=document.querySelector(".report-date input:first-of-type")?.value;
            const to=document.querySelector(".report-date input:last-of-type")?.value;
            toast(from&&to?`Report generated: ${from} to ${to}`:"Select a date range","error");
        });
        const download=document.querySelector(".download-report-btn");
        if(download)download.addEventListener("click",()=>{
            const csv="Report,Value\nTotal Medicines,"+data.medicines.length+"\nTotal Stock,"+
                data.medicines.reduce((s,m)=>s+Number(m.qty),0)+"\nLow Stock,"+
                data.medicines.filter(m=>m.qty>0&&m.qty<=10).length+"\nExpired,0";
            const blob=new Blob([csv],{type:"text/csv"});
            const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="medicare-report.csv";a.click();
            URL.revokeObjectURL(a.href);toast("Report downloaded");
        });
    }

    function setupGenericButtons(){
        document.querySelectorAll("button").forEach(btn=>{
            if(btn.dataset.jsBound)return;
            const text=btn.textContent.trim().toLowerCase();
            const hasAction=btn.classList.contains("edit-btn")||btn.classList.contains("delete-btn")||
                btn.classList.contains("view-btn")||btn.classList.contains("update-stock-btn")||
                btn.classList.contains("add-item-btn")||btn.classList.contains("generate-bill-btn")||
                btn.classList.contains("clear-bill-btn")||btn.classList.contains("add-medicine-btn")||
                btn.classList.contains("add-customer-btn")||btn.classList.contains("add-supplier-btn");
            if(hasAction){btn.dataset.jsBound="1";return;}
            if(["1","2","3","...","106","50","8"].includes(text)) {
                btn.addEventListener("click",()=>toast("Pagination is ready for the current demo data"));
            }
        });
    }

    function init(){
        setupMedicines();
        setupStock();
        setupCustomers();
        setupSuppliers();
        setupBilling();
        setupLogin();
        setupIndex();
        setupAbout();
        setupReports();
        setupGenericButtons();
    }

    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    else init();
})();
