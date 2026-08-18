import { useEffect } from "react";
import PageHeader from "../../../../components/cards/PageHeader";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { contactMessageQueryKey } from "../../../../config/query-key";
import ContactMessageTable from "./component/ContactMessageTable";

const ContactMessage = () => {
    const { usePaginatedQuery } = useAPI();
    const apiUrl = apiConfig.setting.contactUs.contactMessageUrl;

    const {
        data: dataList,
        refetch: fetchData,
        isFetching,
        isLoading
    } = usePaginatedQuery({
        queryKey: [contactMessageQueryKey],
        url: apiUrl
    });

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Contact Message"
                        headerDescription="Manage your contact message"
                    />
                </div>
                <ContactMessageTable
                    // @ts-ignore
                    dataList={dataList}
                    fetchData={fetchData}
                    isLoading={isLoading}
                    isFetching={isFetching}
                />
            </div>
        </>
    );
};

export default ContactMessage;
