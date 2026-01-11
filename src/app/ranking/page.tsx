export default function RankingPage() {
  return (
    <div style={{ background: '#1E1E1E', minHeight: '100vh', color: '#fff', padding: '100px 20px' }}>
      <div className="container text-center">
        <h1 style={{ color: '#FCD535' }}>Asset Rankings</h1>
        <p className="text-secondary">Understanding the NNM Tier System</p>
        <div className="row mt-5 g-4">
            {['Immortals', 'Elite', 'Founders'].map(tier => (
                <div key={tier} className="col-md-4">
                    <div className="p-4 border border-dark rounded bg-black">
                        <h3 className="text-white">{tier}</h3>
                        <p className="text-secondary small">Description for {tier} tier goes here...</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
