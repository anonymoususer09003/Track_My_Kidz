import api from "@/Services";
import { useStripe } from '@stripe/stripe-react-native';

export default async (card: any) => {
    const {createToken} = useStripe()

    await createToken(card)

}
