import { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { formatCurrency } from '@/Utils/formatters';
import { User, Product } from '@/types';

// Interfaces específicas para la vista de impresión
interface SaleItem {
    id: number;
    quantity: number;
    subtotal: number;
    product: Product;
}

interface Sale {
    id: number;
    order_id?: number | null;
    created_at: string;
    formatted_date?: string; // <- AGREGAMOS ESTA PROPIEDAD
    total: number;
    payment_method: string;
    user?: User;
    items: SaleItem[];
}

interface Props {
    sale: Sale;
}

export default function Receipt({ sale }: Props) {
    useEffect(() => {
        // Dispara la impresión apenas cargue la página
        setTimeout(() => {
            window.print();
            // Opcional: window.close(); // Descomentar si deseas que se cierre sola tras imprimir
        }, 500);
    }, []);

    return (
        <div className="ticket">
            <Head title={`Ticket #${sale.id}`} />

            <div className="header">
                <h1>ESTACIÓN VIDEO BAR</h1>
                <p>Nit: 123.456.789-0</p>
                <p>Calle Falsa 123 - Armenia</p>
                <p>Tel: 300 123 4567</p>
            </div>

            <div className="info">
                <p>ORDEN: #{sale.order_id || sale.id}</p>
                {/* USAMOS LA FECHA FORMATEADA QUE VIENE DE LARAVEL */}
                <p>FECHA: {sale.formatted_date || new Date(sale.created_at).toLocaleString('es-CO')}</p>
                <p>CAJERO: {sale.user?.name || 'Administrador'}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>CANT</th>
                        <th>PRODUCTO</th>
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item: SaleItem) => (
                        <tr key={item.id}>
                            <td>{item.quantity}</td>
                            <td>{item.product.name}</td>
                            <td>{formatCurrency(Number(item.subtotal))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="total-section">
                <p>SUBTOTAL: {formatCurrency(Number(sale.total))}</p>
                <p className="grand-total">TOTAL: {formatCurrency(Number(sale.total))}</p>
                <p>Método de Pago: {sale.payment_method.toUpperCase()}</p>
            </div>

            <div className="footer">
                <p>¡Gracias por tu visita!</p>
                <p>Software POS</p>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; padding: 10px; }
                }
                .ticket {
                    width: 80mm; /* Cambiar a 58mm si tu impresora es pequeña */
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 12px;
                    color: black;
                }
                .header, .footer { text-align: center; }
                h1 { font-size: 16px; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th { border-bottom: 1px dashed #000; text-align: left; }
                td { padding: 3px 0; }
                .total-section { border-top: 1px dashed #000; padding-top: 5px; text-align: right; }
                .grand-total { font-size: 16px; font-weight: bold; }
                .info { margin: 10px 0; font-size: 11px; }
            `}</style>
        </div>
    );
}
