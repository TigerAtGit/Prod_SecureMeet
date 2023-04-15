import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: 5,
  boxShadow: 24,
  p: 2,
};

export default function UrlModal({ open, handleClose, urlScanResult }) {

  const fieldNames = {
    unsafe: true, domain: true, ip_address: true,
    dns_valid: true, parking: true, spamming: true,
    malware: true, phishing: true, suspicious: true,
    adult: true, risk_score: true, country_code: true
  };

  const parsedJson = JSON.parse(urlScanResult);
  let scanResultValue = '';

  for (const [name, value] of Object.entries(parsedJson)) {
    if (fieldNames[name]) {
      const formattedName = name.split('_').map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      scanResultValue += `${formattedName}: ${value}\n`;
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2"
          sx={{ fontWeight: 'bold', marginBottom: 2, textAlign: 'center' }}>
          URL Scan Result
        </Typography>

        {urlScanResult &&
          <TextField fullWidth multiline rows={5} value={scanResultValue.trim()} />
        }

      </Box>
    </Modal>
  )
}