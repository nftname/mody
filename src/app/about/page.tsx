export default function AboutPage() {
  return (
    <div style={{ background: '#1E1E1E', minHeight: '100vh', color: '#fff', padding: '100px 20px' }}>
      <div className="container" style={{maxWidth: '800px'}}>
        <h1 className="mb-4 text-center">About NNM</h1>
        <p className="text-secondary mb-5 text-center">
            NNM is the premier marketplace for sovereign digital name assets...
        </p>
        
        <h3 className="mt-5 mb-4 text-white border-bottom border-secondary pb-2">Common Questions</h3>
        <div className="d-flex flex-column gap-3">
            <div>
                <h5 className="text-warning">What is NNM?</h5>
                <p className="text-secondary small">NNM is a decentralized marketplace...</p>
            </div>
            <div>
                <h5 className="text-warning">How to buy?</h5>
                <p className="text-secondary small">Connect wallet and click buy...</p>
            </div>
        </div>
      </div>
    </div>
  );
}
