import { PaymentTransactions } from '@/components/admin/PaymentTransactions';
import { SEO } from '@/components/SEO';

function ManagePayments() {
  return (
    <>
      <SEO 
        title="Kelola Pembayaran - Admin Dashboard" 
        description="Kelola transaksi pembayaran dan integrasi lynk.id"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kelola Pembayaran</h1>
          <p className="text-muted-foreground">
            Pantau dan kelola transaksi pembayaran dari lynk.id
          </p>
        </div>
        
        <PaymentTransactions />
      </div>
    </>
  );
}

export default ManagePayments;