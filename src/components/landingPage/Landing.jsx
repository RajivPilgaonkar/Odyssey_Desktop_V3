import React from 'react';

function Landing () {
  
  //**********************************************************/
  const renderContent = () => {

    return (

      <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: 400}}>

        <div style={{flex: 0.5, height: '100%'}}>
        </div>

        <div style={{flex: 9, height: '100%', display: 'flex', flexDirection: 'row'}}>

          <div style={{flex: 1, width: '100%', display: 'flex', flexDirection: 'column'}}>
            <div style={{flex: 3, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 48, fontWeight: 600}}>
              Back Office
            </div>
            <div style={{flex: 2, width: '100%', justifyContent: 'center', alignItems: 'center', fontSize: 20, fontWeight: 500, paddingLeft: 60, paddingRight: 40}}>            
              Manage Bookings, Tours, Costing, Invoicing & Reporting all in a single software            
            </div>
          </div>

          <div style={{flex: 1, width: '100%'}}>
            <img style={{width:'90%', height: '90%',borderRadius: 20}} src={"landingPage/intro.png"} alt={"Intro Img"} />
          </div>

        </div>

        <div style={{flex: 0.5, height: '100%'}}>
        </div>

      </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default Landing;

