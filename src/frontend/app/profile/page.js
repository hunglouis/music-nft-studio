export default function Profile() {
  return <div>Your Profile</div>;
}

useEffect(() => {
  const channel = supabase
    .channel("tx-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "transactions" },
      (payload) => {
        console.log("New tx:", payload);

        loadTransactions();
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
