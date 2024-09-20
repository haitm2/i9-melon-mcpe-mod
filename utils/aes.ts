import CryptoAesCbc from 'react-native-crypto-aes-cbc';

export async function decryptMelon(text) {
    try {
        var decrypted = await CryptoAesCbc.decryptByBase64(
            'Z2FtbWFwcEAxMjM0NTY3OA==',
            'Z2FtbWFwcEAxMjM0NTY3ODk4NzY1NDMyMTIzNDU2Nzg=',
            text,
            '256'
        );
        return decrypted;
    } catch (err) {
        console.log(err);
        return '';
    }
}

export async function decryptMCPE(text) {
    try {
        var decrypted = await CryptoAesCbc.decryptByBase64(
            'bWFnaWNkZXZAMTIzNDU2Nw==',
            'bWFnaWNkZXZAMTIzNDU2Nzg5ODc2NTQzMjEyMzQ1Njc=',
            text,
            '256'
        );
        return decrypted;
    } catch (err) {
        console.log(err);
        return '';
    }
}


