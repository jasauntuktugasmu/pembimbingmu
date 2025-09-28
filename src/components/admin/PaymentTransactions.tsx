import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PaymentTransaction {
  id: string;
  order_id: string;
  customer_email: string;
  amount: number;
  credits_amount: number;
  status: string;
  payment_method?: string;
  lynk_transaction_id?: string;
  webhook_data?: any;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export function PaymentTransactions() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Gagal mengambil data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleManualProcess = async (transaction: PaymentTransaction) => {
    if (transaction.status !== 'pending') {
      toast.error('Hanya transaksi pending yang bisa diproses manual');
      return;
    }

    try {
      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      // Find and update user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('email', transaction.customer_email.toLowerCase())
        .single();

      if (profile) {
        const { error: creditError } = await supabase
          .from('profiles')
          .update({
            credits: (profile.credits || 0) + transaction.credits_amount
          })
          .eq('id', profile.id);

        if (creditError) throw creditError;
      }

      toast.success(`Berhasil memproses transaksi dan menambah ${transaction.credits_amount} kredit`);
      fetchTransactions();
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      toast.error('Gagal memproses transaksi');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'outline'
    } as const;

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    fetchTransactions();

    // Set up real-time subscription
    const channel = supabase
      .channel('payment_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transaksi Pembayaran</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchTransactions}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Email Customer</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Kredit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Belum ada transaksi pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.order_id}
                    </TableCell>
                    <TableCell>{transaction.customer_email}</TableCell>
                    <TableCell>
                      Rp {transaction.amount.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {transaction.credits_amount}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Detail Transaksi</DialogTitle>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Order ID:</span>
                                    <p className="font-mono">{selectedTransaction.order_id}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span>
                                    <p>{getStatusBadge(selectedTransaction.status)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Email:</span>
                                    <p>{selectedTransaction.customer_email}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Jumlah:</span>
                                    <p>Rp {selectedTransaction.amount.toLocaleString('id-ID')}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Kredit:</span>
                                    <p>{selectedTransaction.credits_amount}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Metode:</span>
                                    <p>{selectedTransaction.payment_method || 'lynk.id'}</p>
                                  </div>
                                </div>
                                {selectedTransaction.webhook_data && (
                                  <div>
                                    <span className="font-medium">Webhook Data:</span>
                                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                      {JSON.stringify(selectedTransaction.webhook_data, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {transaction.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleManualProcess(transaction)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Webhook URL lynk.id:</h4>
          <code className="text-sm bg-background p-2 rounded border block">
            https://gwxwuplmjzlwnqvutkla.supabase.co/functions/v1/lynk-webhook
          </code>
          <p className="text-sm text-muted-foreground mt-2">
            Gunakan URL ini sebagai webhook endpoint di dashboard lynk.id Anda.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}