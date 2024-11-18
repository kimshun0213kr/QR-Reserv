import {
    Image,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    VStack,
    Text, 
    } from "@chakra-ui/react";
import {ExternalLinkIcon} from "@chakra-ui/icons"


export function GoodsComponent({name,description,image}:{name:string,description:string,image:string}){
    const {isOpen,onOpen,onClose} = useDisclosure()
    return(
        <>
        <ExternalLinkIcon onClick={onOpen} />
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader>{name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                {image ? <Image src={image} /> : null}
                {description}
            </ModalBody>

            <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={onClose}>
                閉じる
                </Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}