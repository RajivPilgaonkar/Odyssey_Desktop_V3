import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import ReactPDF from '@react-pdf/renderer';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import {Button} from 'devextreme-react/button';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

// Create Document Component
const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
      </View>
      <View style={styles.section}>
        <Text>Section #2</Text>
      </View>
    </Page>
  </Document>
);

class PdfTrial extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

  }

  //**********************************************************/
  async componentDidMount() {

    this._isMounted = true;
  }

  //**********************************************************/
  componentWillUnmount = async () => {
    this._isMounted = false;
  }

  //**********************************************************/
  saveSelection = async () => {
    ReactPDF.render(<MyDocument />, `${__dirname}/example.pdf`);    
  }
      
  //**********************************************************/
  renderContent() {

    const btnSaveProps = {id: "saveButton", text: "Pdf File", 
      type: "default", visible: true, stylingMode: 'text',
      onClick: this.saveSelection, style: {fontSize: 16}};

    return (
      <div >

        <div style={{display: 'flex', flexDirection: 'column', height: 50, border: '1px solid black'}}>
          <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Button {...btnSaveProps} />
          </div>
          <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <PDFDownloadLink document={<MyDocument />} fileName="example.pdf">
              {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download now!')}
            </PDFDownloadLink>            
          </div>
        </div>


      </div>

    );


  }

  //**********************************************************/
  render() {

    return (
      this.renderContent()
    );
  }

}

const mapStateToProps = (state) => {
  return {
    dbUser: state.dbUser,
    voucherParams: state.voucherParams
  };
};

const mapDispatchToProps = () => {
  return {
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(PdfTrial));

