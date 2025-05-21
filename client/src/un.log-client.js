import { LitElement, html } from 'lit'
import '@vaadin/checkbox'
import '@vaadin/grid'
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-filter-column.js';
import '@vaadin/icons';
import '@vaadin/text-field';
import { columnBodyRenderer } from '@vaadin/grid/lit.js';

const URL_LOGS = 'http://127.0.0.1:4212'

export class ViewLogs extends LitElement {
    static properties = {
        loading: {
            type: Boolean
        },
        items: {
            type: Array
        },
        filteredItems: {
            type: Array
        },
        error: {
            type: Object
        },
    }
    constructor() {
        super()
        this.items = []
        this.filteredItems = this.items
        this.html = {}
        this.error = null
        this.loading = true
        this.fetchData(URL_LOGS)
        this.rendered = false
    }

    createRenderRoot() {
        return this
    }

    connectedCallback() {
        super.connectedCallback()
    }

    async fetchData(url) {
        try {
            console.log(`Fetching ${url} ...`)
            const res = await fetch(url)
            if (!res.ok) {
                throw new Error(`API Error: ${res.status}: ${res.statusText}`)
            }
            const dailyReports = await res.json()

            for (const report of dailyReports) {
                // combine all daily reports in one array
                this.items.push(...report)
            }

            this.loading = false

        } catch (error) {
            this.error = error
        }
    }

    render() {
        console.log('render()')

        if (this.error != null) {
            return html`<div class="error">${this.error.message}</div>`
        }
        if (this.loading == true) {
            return html`Loading...`
        }

        return html`
            ${this.renderVaadinSearchField()}
            ${this.renderVaadinGrid()}`
    }

    renderVaadinSearchField() {
        return html`
            <vaadin-vertical-layout theme="spacing">
            <vaadin-text-field
                placeholder="Search"
                style="width: 50%;"
                @value-changed="${(evt) => {
                const searchTerm = (evt.detail.value || '').trim();
                const matchesTerm = (value) => value.toLowerCase().includes(searchTerm.toLowerCase());
                this.filteredItems = this.items.filter(({ MESSAGE, reportType, PRIORITY, host }) => !searchTerm || matchesTerm(MESSAGE) || matchesTerm(reportType) || matchesTerm(PRIORITY) || matchesTerm(host));}}">
                <vaadin-icon slot="prefix" icon="vaadin:search"></vaadin-icon>
            </vaadin-text-field>`
    }

    renderVaadinGrid() {
        return html`
            <vaadin-grid .items="${this.filteredItems}" .cellPartNameGenerator="${this.cellPartNameGenerator}" theme="row-dividers" column-reordering-allowed multi-sort>
                <vaadin-grid-sort-column width="10rem" path="__REALTIME_TIMESTAMP" header="Date" class="col-date" ${columnBodyRenderer(this.convertDate)}></vaadin-grid-sort-column>
                <vaadin-grid-sort-column width="6rem" header="Host" path="host" class="col-host"></vaadin-grid-sort-column>
                <vaadin-grid-sort-column width="6rem" header="Report" path="reportType" class="col-type"></vaadin-grid-sort-column>
                <vaadin-grid-sort-column width="3rem" header="Priority" path="PRIORITY" class="log-prio"></vaadin-grid-sort-column>
                <vaadin-grid-sort-column auto-width header="Message" path="MESSAGE" class="col-message"></vaadin-grid-sort-column>
            </vaadin-grid>`
    }

    /* firstUpdated() {
        console.log('firstUpdated()')
    } */

    /* updated() {
        console.log('updated()')
    } */

    cellPartNameGenerator(_column, model) {
        const item = model.item;
        let parts = '';
        parts += ` prio-${item.PRIORITY}`;
        
        return parts
    }

    convertDate(item, _model, _column) {
        const date = new Date(item.__REALTIME_TIMESTAMP / 1000) // convert microseconds to miliseconds
        return html`${this.getFormattedDate(date)}`
    }

    getFormattedDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}-${hours}:${minutes}`;
    }
}

customElements.define('view-logs', ViewLogs)